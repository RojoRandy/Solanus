import { existsSync, promises as fs } from 'fs';
import * as path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { HorarioComida, MetodoPagoDonativo, OrigenLote, TipoMovimiento } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfService } from '@/common/pdf/pdf.service';
import { escapar } from '@/common/pdf/html.util';
import { formatFechaSoloDia, now } from '@/common/utils/date';
import { resolverPeriodoMensual } from '@/common/utils/periodo.util';
import { ReportesErrors } from '@/common/errors/reportes.errors';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '@/common/storage/storage.service.interface';
import { DONATIVO_DINERO_SELECT, mapDonativoDinero } from '@/modules/donativos/usecases/donativo-dinero.mapper';
import { ReporteAsistenciaUseCase } from './reporte-asistencia.usecase';

export interface ReporteMensualPdfArgs {
  anio?: number;
  mes?: number;
}

export interface ReporteMensualPdf {
  buffer: Buffer;
  filename: string;
}

const ENCABEZADO_MOVIMIENTOS = `<thead><tr><th>Fecha</th><th>Lote</th><th>Producto</th><th>Unidad</th><th>Tipo</th><th>Motivo</th><th>Cantidad</th><th>Costo unit.</th><th>Costo total</th><th>Bienhechor</th><th>CFDI</th></tr></thead>`;

const COLOR_VINO = '#6B3140';
const COLOR_AMBAR = '#FFBF00';
const COLOR_TEXTO_AMBAR = '#2A2020';

// Fotos embebidas como data URI: cada una pasa por base64 (~1.37x su tamaño) antes de
// llegar a Chromium. Con el tope de 5 MB por foto (ImageUploadInterceptor), 40 fotos son
// ~270 MB de string en el heap — holgado para un contenedor chico, más que eso arriesga OOM.
// ponytail: si el tope resulta insuficiente, la salida es servir <img src="{PUBLIC_URL}/uploads/...">
// (URL pública, no data URI) con page.setContent(html, { waitUntil: 'networkidle0' }) — Chromium
// descarga en streaming y el heap de Node nunca toca los bytes de las fotos.
const LIMITE_EVIDENCIAS_PDF = 40;
const FOTOS_POR_PAGINA = 4;

const ETIQUETA_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

const ETIQUETA_HORARIO: Record<HorarioComida, string> = {
  DESAYUNO: 'Desayuno',
  COMIDA: 'Comida',
  CENA: 'Cena',
};

const ETIQUETA_METODO_PAGO: Record<MetodoPagoDonativo, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
  DEPOSITO: 'Depósito',
};

const MIME_POR_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * En dev (ts-node) este archivo vive en src/modules/reportes/usecases; en build compila a
 * dist/src/... (prisma/seed.ts fuera de src/ obliga a TS a usar la raíz del paquete como
 * rootDir), mientras nest-cli copia los assets a dist/common/... Se prueban ambas rutas —
 * mismo patrón que generar-pdf-expediente.usecase.ts.
 */
function resolverAssetsDir(): string {
  const candidatos = [
    path.join(__dirname, '../../../common/pdf/assets'),
    path.join(__dirname, '../../../../common/pdf/assets'),
  ];
  return candidatos.find((candidato) => existsSync(candidato)) ?? candidatos[0];
}

const ASSETS_DIR = resolverAssetsDir();

interface FilaMovimiento {
  fecha: Date;
  productoNombre: string;
  unidad: string;
  tipo: TipoMovimiento;
  motivo: string;
  cantidad: number;
  entradaId: number | null;
  costoUnitario: number | null;
  bienhechor: string;
  bienhechorId: number | null;
  cfdi: string | null;
  origen: OrigenLote | null;
}

interface FilaDonativo {
  bienhechorId: number;
  fecha: string;
  bienhechor: string;
  monto: number;
  metodoPago: MetodoPagoDonativo;
  folioRecibo: string | null;
}

function formatoMoneda(monto: number): string {
  return escapar(monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
}

@Injectable()
export class ReporteMensualPdfUseCase implements UseCase<
  ReporteMensualPdfArgs,
  ReporteMensualPdf
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly reporteAsistencia: ReporteAsistenciaUseCase,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute({ anio, mes }: ReporteMensualPdfArgs): Promise<ReporteMensualPdf> {
    const periodo = resolverPeriodoMensual(anio, mes);

    const totalEvidencias = await this.prisma.evidenciaMensual.count({
      where: { anio: periodo.anio, mes: periodo.mes },
    });
    if (totalEvidencias > LIMITE_EVIDENCIAS_PDF) {
      throw ReportesErrors.Exceptions.DEMASIADAS_EVIDENCIAS_PARA_PDF({
        total: totalEvidencias,
        limite: LIMITE_EVIDENCIAS_PDF,
      });
    }

    const [asistencia, movimientosRaw, donativosRaw, evidenciasRaw, logoComedor, logoAbp] = await Promise.all([
      this.reporteAsistencia.execute({ anio: periodo.anio, mes: periodo.mes }),
      // Replica el orden de GET /inventario/movimientos (fecha desc); sin paginar, es un documento.
      this.prisma.movimientoInventario.findMany({
        where: { fecha: { gte: periodo.desde, lt: periodo.hasta } },
        orderBy: { fecha: 'desc' },
        select: {
          fecha: true,
          tipo: true,
          cantidad: true,
          variante: { select: { producto: { select: { nombre: true } }, unidad: { select: { abrevia: true } } } },
          motivo: { select: { nombre: true } },
          lote: {
            select: {
              entradaId: true,
              costoUnitario: true,
              entrada: { select: { cfdi: true } },
              origen: true,
              bienhechor: { select: { id: true, nombre: true } },
            },
          },
        },
      }),
      // Replica el orden de GET /donativos (fecha desc, id desc).
      this.prisma.donativoDinero.findMany({
        where: { fecha: { gte: periodo.desde, lt: periodo.hasta } },
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        select: DONATIVO_DINERO_SELECT,
      }),
      this.prisma.evidenciaMensual.findMany({
        where: { anio: periodo.anio, mes: periodo.mes },
        orderBy: { createdAt: 'asc' },
        select: { rutaArchivo: true },
      }),
      this.archivoComoDataUri(path.join(ASSETS_DIR, 'logo-comedor.png')),
      this.archivoComoDataUri(path.join(ASSETS_DIR, 'logo-abp.png')),
    ]);

    const movimientos: FilaMovimiento[] = movimientosRaw.map((m) => ({
      fecha: m.fecha,
      productoNombre: m.variante.producto.nombre,
      unidad: m.variante.unidad.abrevia,
      tipo: m.tipo,
      motivo: m.motivo.nombre,
      cantidad: Number(m.cantidad),
      entradaId: m.lote?.entradaId ?? null,
      costoUnitario: m.lote?.costoUnitario != null ? Number(m.lote.costoUnitario) : null,
      bienhechor: m.lote?.bienhechor?.nombre ?? '—',
      bienhechorId: m.lote?.bienhechor?.id ?? null,
      cfdi: m.lote?.entrada?.cfdi ?? null,
      origen: m.lote?.origen ?? null,
    }));

    const donativos: FilaDonativo[] = donativosRaw.map(mapDonativoDinero).map((d) => ({
      fecha: d.fecha,
      bienhechorId: d.bienhechor.id,
      bienhechor: d.bienhechor.nombre,
      monto: d.monto,
      metodoPago: d.metodoPago,
      folioRecibo: d.folioRecibo,
    }));

    const fotos = await Promise.all(
      evidenciasRaw.map((e) => this.archivoStorageComoDataUri(e.rutaArchivo)),
    );

    const html = this.construirHtml(periodo, asistencia, movimientos, donativos, fotos.filter((f): f is string => f !== null), {
      logoComedor,
      logoAbp,
    });
    const buffer = await this.pdfService.render(html, {
      landscape: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    const filename = `reporte-${periodo.anio}-${String(periodo.mes).padStart(2, '0')}.pdf`;
    return { buffer, filename };
  }

  private bufferComoDataUri(buffer: Buffer, rutaOExtension: string): string {
    const extension = path.extname(rutaOExtension).toLowerCase();
    const mime = MIME_POR_EXTENSION[extension] ?? 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  private async archivoComoDataUri(absolutePath: string): Promise<string | null> {
    try {
      const buffer = await fs.readFile(absolutePath);
      return this.bufferComoDataUri(buffer, absolutePath);
    } catch {
      return null;
    }
  }

  private async archivoStorageComoDataUri(rutaRelativa: string): Promise<string | null> {
    try {
      const buffer = await this.storage.read(rutaRelativa);
      return this.bufferComoDataUri(buffer, rutaRelativa);
    } catch {
      return null;
    }
  }

  private construirHtml(
    periodo: ReturnType<typeof resolverPeriodoMensual>,
    asistencia: Awaited<ReturnType<ReporteAsistenciaUseCase['execute']>>,
    movimientos: FilaMovimiento[],
    donativos: FilaDonativo[],
    fotos: string[],
    imagenes: { logoComedor: string | null; logoAbp: string | null },
  ): string {
    const encabezado = (titulo: string) => `
      <div class="marca">
        ${imagenes.logoComedor ? `<img src="${imagenes.logoComedor}" alt="Logotipo Comedor Solanus" />` : '<span></span>'}
        <h1>Comedor Solanus — ${escapar(titulo)}</h1>
        ${imagenes.logoAbp ? `<img src="${imagenes.logoAbp}" alt="Logotipo Amigos de los Capuchinos ABP" />` : '<span></span>'}
      </div>
      <p class="periodo">${escapar(periodo.etiqueta)} — generado el ${now().format('DD/MM/YYYY HH:mm')}</p>
    `;

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2A2020; margin: 0; padding: 0; }
  section { break-before: page; }
  section:first-child { break-before: auto; }
  .marca { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .marca img { height: 40px; object-fit: contain; }
  .marca h1 { flex: 1; text-align: center; color: ${COLOR_VINO}; font-size: 16px; margin: 0; }
  .periodo { text-align: center; color: #6B6B6B; font-size: 11px; margin: 4px 0 14px; border-bottom: 2px solid ${COLOR_VINO}; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; }
  thead { display: table-header-group; }
  th { background: ${COLOR_VINO}; color: #fff; text-align: left; padding: 4px 5px; font-size: 8px; text-transform: uppercase; letter-spacing: .02em; }
  td { padding: 3px 5px; border-bottom: 1px solid #eee; }
  tr { break-inside: avoid; }
  tbody tr:nth-child(even) { background: #FAF7F7; }
  .kpis { display: flex; gap: 12px; margin-bottom: 12px; }
  .kpi { flex: 1; border: 1px solid #eee; border-radius: 6px; padding: 8px 10px; }
  .kpi .valor { font-size: 16px; font-weight: 700; color: ${COLOR_VINO}; }
  .kpi .etiqueta { font-size: 9px; color: #6B6B6B; }
  .matriz th, .matriz td { text-align: center; padding: 2px; font-size: 7px; white-space: nowrap; }
  .matriz th:first-child, .matriz td:first-child { text-align: left; padding-left: 4px; }
  .matriz td.ambar { background: ${COLOR_AMBAR}; color: ${COLOR_TEXTO_AMBAR}; font-weight: 600; }
  .pagina-fotos { break-after: page; display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 10px; }
  .pagina-fotos:last-child { break-after: auto; }
  .pagina-fotos figure { margin: 0; break-inside: avoid; height: 82mm; }
  .pagina-fotos img { width: 100%; height: 100%; object-fit: contain; border-radius: 4px; }
  .subtitulo { color: ${COLOR_VINO}; font-size: 12px; margin: 16px 0 6px; break-after: avoid; }
  .subtotal { font-weight: 700; }
  .totales-especie { break-inside: avoid; page-break-inside: avoid; }
  .vacio { color: #999; font-size: 11px; padding: 12px 0; }
</style>
</head>
<body>
  <section>
    ${encabezado('Asistencia')}
    <div class="kpis">
      <div class="kpi"><div class="valor">${asistencia.totalAsistencias}</div><div class="etiqueta">Total del mes</div></div>
      <div class="kpi"><div class="valor">${asistencia.desayuno}</div><div class="etiqueta">Desayuno</div></div>
      <div class="kpi"><div class="valor">${asistencia.comida}</div><div class="etiqueta">Comida</div></div>
      <div class="kpi"><div class="valor">${asistencia.cena}</div><div class="etiqueta">Cena</div></div>
      <div class="kpi"><div class="valor">${asistencia.totalPrimeraVez}</div><div class="etiqueta">Primera vez</div></div>
    </div>
    ${this.tablaAsistencia(asistencia)}
    ${this.tablaPrimeraVez(asistencia)}
  </section>

  <section>
    ${encabezado('Inventario')}
    ${this.tablaMovimientos(movimientos)}
    <h3 class="subtitulo">Donaciones en especie por bienhechor</h3>
    ${this.tablaDonacionesEspecie(movimientos)}
  </section>

  <section>
    ${encabezado('Donativos')}
    ${this.tablaDonativos(donativos)}
    ${this.tablaTotalesDonativos(donativos)}
  </section>

  <section>
    ${encabezado('Evidencias')}
    ${this.seccionFotos(fotos)}
  </section>
</body>
</html>`;
  }

  private tablaAsistencia(asistencia: Awaited<ReturnType<ReporteAsistenciaUseCase['execute']>>): string {
    if (asistencia.comensales.length === 0 && asistencia.totalPrimeraVez === 0)
      return '<p class="vacio">Sin asistencias registradas este mes.</p>';

    const dias = Array.from({ length: asistencia.diasDelMes }, (_, i) => i + 1);
    const encabezadoDias = dias.map((d) => `<th>${d}</th>`).join('');
    const filas = asistencia.comensales
      .map((fila) => {
        const celdas = fila.dias
          .map((valor) => (valor > 0 ? `<td class="ambar">${valor}</td>` : '<td></td>'))
          .join('');
        return `<tr><td>${fila.folio} ${escapar(fila.nombre)}</td>${celdas}<td>${fila.total}</td></tr>`;
      })
      .join('');
    const totales = asistencia.totalesPorDia.map((t) => `<td>${t > 0 ? t : ''}</td>`).join('');
    const primeraVez = asistencia.primeraVezPorDia.map((t) => `<td>${t > 0 ? t : ''}</td>`).join('');

    return `<table class="matriz">
      <thead><tr><th>Comensal</th>${encabezadoDias}<th>Total</th></tr></thead>
      <tbody>
        ${filas}
        <tr><td><strong>Total comensales</strong></td>${totales}<td>${asistencia.totalAsistencias}</td></tr>
        <tr><td><strong>Primera vez</strong></td>${primeraVez}<td>${asistencia.totalPrimeraVez}</td></tr>
      </tbody>
    </table>`;
  }

  private tablaPrimeraVez(asistencia: Awaited<ReturnType<ReporteAsistenciaUseCase['execute']>>): string {
    if (asistencia.primeraVez.length === 0) return '<p class="vacio">Sin asistentes de primera vez este mes.</p>';

    const filas = asistencia.primeraVez
      .map(
        (r) => `<tr>
          <td>${formatFechaSoloDia(r.fecha)}</td>
          <td>${ETIQUETA_HORARIO[r.horario]}</td>
          <td>${escapar(r.nombre)}</td>
        </tr>`,
      )
      .join('');

    return `<h2 class="subtitulo">Primera vez</h2>
    <table>
      <thead><tr><th>Fecha</th><th>Turno</th><th>Nombre</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
  }

  private tablaMovimientos(movimientos: FilaMovimiento[]): string {
    if (movimientos.length === 0) return '<p class="vacio">Sin movimientos registrados este mes.</p>';

    const filas = movimientos.map((m) => this.filaMovimiento(m)).join('');

    return `<table>
      ${ENCABEZADO_MOVIMIENTOS}
      <tbody>${filas}</tbody>
    </table>`;
  }

  private filaMovimiento(m: FilaMovimiento): string {
    return `<tr>
          <td>${escapar(formatFechaSoloDia(m.fecha))}</td>
          <td>${escapar(m.entradaId !== null ? `#${m.entradaId}` : '—')}</td>
          <td>${escapar(m.productoNombre)}</td>
          <td>${escapar(m.unidad)}</td>
          <td>${escapar(ETIQUETA_TIPO_MOVIMIENTO[m.tipo])}</td>
          <td>${escapar(m.motivo)}</td>
          <td>${escapar(String(m.cantidad))}</td>
          <td>${m.costoUnitario !== null ? formatoMoneda(m.costoUnitario) : '—'}</td>
          <td>${m.costoUnitario !== null ? formatoMoneda(Number((Math.abs(m.cantidad) * m.costoUnitario).toFixed(2))) : '—'}</td>
          <td>${escapar(m.bienhechor)}</td>
          <td>${m.cfdi ? escapar(m.cfdi) : '—'}</td>
        </tr>`;
  }

  private tablaDonativos(donativos: FilaDonativo[]): string {
    if (donativos.length === 0) return '<p class="vacio">Sin donativos en dinero registrados este mes.</p>';

    const filas = donativos
      .map(
        (d) => `<tr>
          <td>${formatFechaSoloDia(new Date(d.fecha))}</td>
          <td>${escapar(d.bienhechor)}</td>
          <td>${formatoMoneda(d.monto)}</td>
          <td>${ETIQUETA_METODO_PAGO[d.metodoPago]}</td>
          <td>${d.folioRecibo ? escapar(d.folioRecibo) : '—'}</td>
        </tr>`,
      )
      .join('');

    return `<table>
      <thead><tr><th>Fecha</th><th>Bienhechor</th><th>Monto</th><th>Método</th><th>Folio</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
  }

  private tablaDonacionesEspecie(movimientos: FilaMovimiento[]): string {
    const donaciones = movimientos.filter(
      (m) => m.tipo === TipoMovimiento.ENTRADA && m.origen === OrigenLote.DONADO,
    );
    if (donaciones.length === 0) return '<p class="vacio">Sin donaciones en especie este mes.</p>';

    const porBienhechor = new Map<number | null, { nombre: string; movimientos: FilaMovimiento[] }>();
    for (const m of donaciones) {
      const grupo = porBienhechor.get(m.bienhechorId) ?? {
        nombre: m.bienhechorId === null ? 'Sin bienhechor' : m.bienhechor,
        movimientos: [],
      };
      grupo.movimientos.push(m);
      porBienhechor.set(m.bienhechorId, grupo);
    }

    const contarLotes = (filas: FilaMovimiento[]) =>
      new Set(filas.flatMap((m) => m.entradaId === null ? [] : [m.entradaId])).size;
    const sumarCosto = (filas: FilaMovimiento[]) => filas.reduce(
      (total, m) => total + (m.costoUnitario !== null ? Math.abs(m.cantidad) * m.costoUnitario : 0),
      0,
    );
    const grupos = [...porBienhechor.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    const tablas = grupos.map((grupo, indice) => `
      <h3 class="subtitulo">${escapar(grupo.nombre)}</h3>
      <table>
        ${ENCABEZADO_MOVIMIENTOS}
        <tbody>
          ${grupo.movimientos.map((m) => this.filaMovimiento(m)).join('')}
          ${indice === grupos.length - 1 ? '</tbody><tbody class="totales-especie">' : ''}
          <tr class="subtotal">
            <td>Subtotal</td><td>${contarLotes(grupo.movimientos)} lote(s)</td>
            <td colspan="6"></td><td>${formatoMoneda(sumarCosto(grupo.movimientos))}</td><td colspan="2"></td>
          </tr>
          ${indice === grupos.length - 1 ? `<tr><td colspan="11">Total donaciones en especie: ${contarLotes(donaciones)} lote(s) · ${formatoMoneda(sumarCosto(donaciones))}</td></tr>` : ''}
        </tbody>
      </table>`).join('');

    return tablas;
  }

  private tablaTotalesDonativos(donativos: FilaDonativo[]): string {
    if (donativos.length === 0) return '';

    const porBienhechor = new Map<number, { nombre: string; cantidad: number; monto: number }>();
    for (const d of donativos) {
      const total = porBienhechor.get(d.bienhechorId) ?? { nombre: d.bienhechor, cantidad: 0, monto: 0 };
      total.cantidad += 1;
      total.monto += d.monto;
      porBienhechor.set(d.bienhechorId, total);
    }
    const totales = [...porBienhechor.values()].sort((a, b) => b.monto - a.monto);
    const filas = totales.map((b) => `<tr>
      <td>${escapar(b.nombre)}</td><td>${escapar(String(b.cantidad))}</td><td>${formatoMoneda(b.monto)}</td>
    </tr>`).join('');
    const montoTotal = totales.reduce((total, b) => total + b.monto, 0);

    return `<h3 class="subtitulo">Totales por bienhechor</h3>
    <table>
      <thead><tr><th>Bienhechor</th><th>Donativos</th><th>Monto total</th></tr></thead>
      <tbody>${filas}<tr><td><strong>Total</strong></td><td>${escapar(String(donativos.length))}</td><td>${formatoMoneda(montoTotal)}</td></tr></tbody>
    </table>`;
  }

  private seccionFotos(fotos: string[]): string {
    if (fotos.length === 0) return '<p class="vacio">Sin evidencias cargadas este mes.</p>';

    const paginas: string[] = [];
    for (let i = 0; i < fotos.length; i += FOTOS_POR_PAGINA) {
      const grupo = fotos.slice(i, i + FOTOS_POR_PAGINA);
      const figuras = grupo.map((foto) => `<figure><img src="${foto}" alt="Evidencia" /></figure>`).join('');
      paginas.push(`<div class="pagina-fotos">${figuras}</div>`);
    }
    return paginas.join('');
  }
}
