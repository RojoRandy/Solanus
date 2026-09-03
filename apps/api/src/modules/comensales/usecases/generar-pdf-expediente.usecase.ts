import { Inject, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfService } from '@/common/pdf/pdf.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { now } from '@/common/utils/date';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '@/common/storage/storage.service.interface';
import { calcularEdad, esMayorDeEdad } from '../utils/edad.util';
import { comensalDetalleSelect } from '../utils/comensal-select.util';

export interface ExpedienteComensalPdf {
  buffer: Buffer;
  filename: string;
}

const MIME_POR_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const COLOR_VINO = '#6B3140';

/**
 * En dev (ts-node) este archivo vive en src/modules/comensales/usecases; en
 * build compila a dist/src/... porque prisma/seed.ts (fuera de src/) obliga a
 * TS a usar la raíz del paquete como rootDir. nest-cli, en cambio, copia los
 * assets a dist/common/... (sin el prefijo src). Se prueban ambas rutas.
 */
function resolverAssetsDir(): string {
  const candidatos = [
    path.join(__dirname, '../../../common/pdf/assets'),
    path.join(__dirname, '../../../../common/pdf/assets'),
  ];
  return candidatos.find((candidato) => existsSync(candidato)) ?? candidatos[0];
}

const ASSETS_DIR = resolverAssetsDir();

/** El expediente necesita, además de lo del listado/detalle, la INE del tutor. */
const EXPEDIENTE_SELECT = {
  ...comensalDetalleSelect,
  tutor: {
    select: {
      id: true,
      folio: true,
      nombres: true,
      apellidos: true,
      ineFrontPath: true,
      ineBackPath: true,
    },
  },
} satisfies Prisma.ComensalSelect;

type ComensalExpediente = Prisma.ComensalGetPayload<{
  select: typeof EXPEDIENTE_SELECT;
}>;

@Injectable()
export class GenerarPdfExpedienteUseCase implements UseCase<
  number,
  ExpedienteComensalPdf
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute(id: number): Promise<ExpedienteComensalPdf> {
    const comensal = await this.prisma.comensal.findUnique({
      where: { id },
      select: EXPEDIENTE_SELECT,
    });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    try {
      const [logoComedor, logoAbp, foto, ineFrente, ineReverso] = await Promise.all([
        this.archivoComoDataUri(path.join(ASSETS_DIR, 'logo-comedor.png')),
        this.archivoComoDataUri(path.join(ASSETS_DIR, 'logo-abp.png')),
        this.archivoStorageComoDataUri(comensal.fotoPath),
        this.archivoStorageComoDataUri(
          esMayorDeEdad(comensal.fechaNacimiento) ? comensal.ineFrontPath : (comensal.tutor?.ineFrontPath ?? null),
        ),
        this.archivoStorageComoDataUri(
          esMayorDeEdad(comensal.fechaNacimiento) ? comensal.ineBackPath : (comensal.tutor?.ineBackPath ?? null),
        ),
      ]);

      const html = this.construirHtml(comensal, { logoComedor, logoAbp, foto, ineFrente, ineReverso });
      const buffer = await this.pdfService.render(html, {
        margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      });

      return { buffer, filename: `expediente-${comensal.folio}.pdf` };
    } catch (error) {
      throw ComensalErrors.Exceptions.ERROR_GENERANDO_PDF_EXPEDIENTE({
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async archivoComoDataUri(absolutePath: string): Promise<string | null> {
    const extension = path.extname(absolutePath).toLowerCase();
    const mime = MIME_POR_EXTENSION[extension] ?? 'image/png';
    try {
      const buffer = await fs.readFile(absolutePath);
      return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch {
      return null;
    }
  }

  private async archivoStorageComoDataUri(rutaRelativa: string | null | undefined): Promise<string | null> {
    if (!rutaRelativa) return null;
    return this.archivoComoDataUri(this.storage.resolveAbsolutePath(rutaRelativa));
  }

  private construirHtml(
    comensal: ComensalExpediente,
    imagenes: {
      logoComedor: string | null;
      logoAbp: string | null;
      foto: string | null;
      ineFrente: string | null;
      ineReverso: string | null;
    },
  ): string {
    const nombreCompleto = `${comensal.nombres} ${comensal.apellidos}`;
    const edad = calcularEdad(comensal.fechaNacimiento);
    const esMenor = !esMayorDeEdad(comensal.fechaNacimiento);
    const fechaNacimientoTexto = dayjs(comensal.fechaNacimiento).format('DD/MM/YYYY');
    const fechaGeneracionTexto = now().format('DD/MM/YYYY HH:mm');

    const autoriza = comensal.cartaUsoImagen?.autoriza ?? false;
    const fechaFirma = comensal.cartaUsoImagen?.fechaFirma
      ? dayjs(comensal.cartaUsoImagen.fechaFirma).format('DD/MM/YYYY')
      : null;

    const menoresHtml = comensal.menores.length
      ? `
        <div class="seccion">
          <h2>Menores a su cargo</h2>
          <ul>
            ${comensal.menores
              .map((m) => `<li>Folio ${m.folio} — ${m.nombres} ${m.apellidos}</li>`)
              .join('')}
          </ul>
        </div>`
      : '';

    const tutorHtml =
      esMenor && comensal.tutor
        ? `
        <div class="seccion">
          <h2>Datos del tutor</h2>
          <div class="datos">
            <div class="dato"><div class="etiqueta">Folio del tutor</div><div class="valor">${comensal.tutor.folio}</div></div>
            <div class="dato"><div class="etiqueta">Nombre del tutor</div><div class="valor">${comensal.tutor.nombres} ${comensal.tutor.apellidos}</div></div>
          </div>
        </div>`
        : '';

    const ineHtml =
      imagenes.ineFrente || imagenes.ineReverso
        ? `
        <div class="seccion">
          <h2>INE ${esMenor ? 'del tutor' : ''}</h2>
          <div class="ine-grid">
            ${imagenes.ineFrente ? `<div><img class="ine" src="${imagenes.ineFrente}" alt="INE frente" /><p class="ine-etiqueta">Frente</p></div>` : ''}
            ${imagenes.ineReverso ? `<div><img class="ine" src="${imagenes.ineReverso}" alt="INE reverso" /><p class="ine-etiqueta">Reverso</p></div>` : ''}
          </div>
        </div>`
        : '';

    const etiquetaFirma = esMenor
      ? 'Firma de autorización de uso de imagen del tutor'
      : 'Firma de autorización de uso de imagen';

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2A2020; margin: 0; padding: 0; }
  .marca { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
  .marca img { height: 68px; object-fit: contain; }
  .marca h1 { flex: 1; text-align: center; color: ${COLOR_VINO}; font-size: 20px; margin: 0; }
  .encabezado { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${COLOR_VINO}; padding-bottom: 16px; margin-bottom: 20px; }
  .encabezado h2.titulo { color: ${COLOR_VINO}; font-size: 18px; margin: 0 0 4px; }
  .encabezado p { margin: 0; color: #6B6B6B; font-size: 12px; }
  .foto { width: 100px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
  .foto-placeholder { width: 100px; height: 120px; border-radius: 6px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #999; font-size: 11px; text-align: center; }
  .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-bottom: 18px; }
  .dato .etiqueta { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #8A8A8A; margin-bottom: 2px; }
  .dato .valor { font-size: 14px; font-weight: 600; }
  .seccion { margin-bottom: 18px; }
  .seccion h2 { font-size: 13px; color: ${COLOR_VINO}; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; }
  .seccion ul { margin: 0; padding-left: 18px; font-size: 13px; }
  .ine-grid { display: flex; gap: 16px; }
  .ine-grid img.ine { width: 260px; height: 164px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
  .ine-etiqueta { text-align: center; font-size: 11px; color: #6B6B6B; margin: 4px 0 0; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge.si { background: #E4EDE1; color: #3E6B3A; }
  .badge.no { background: #F3E2E2; color: #8A2E2E; }
  .firma { margin-top: 40px; display: flex; gap: 40px; }
  .firma .linea { flex: 1; border-top: 1px solid #444; padding-top: 6px; font-size: 11px; color: #6B6B6B; text-align: center; }
  .interno { margin-top: 40px; border-top: 1px dashed #bbb; padding-top: 10px; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="marca">
    ${imagenes.logoComedor ? `<img src="${imagenes.logoComedor}" alt="Logotipo Comedor Solanus" />` : '<span></span>'}
    <h1>Comedor Solanus</h1>
    ${imagenes.logoAbp ? `<img src="${imagenes.logoAbp}" alt="Logotipo Amigos de los Capuchinos ABP" />` : '<span></span>'}
  </div>

  <div class="encabezado">
    <div>
      <h2 class="titulo">Expediente de comensal</h2>
      <p>Folio ${comensal.folio}</p>
    </div>
    ${imagenes.foto ? `<img class="foto" src="${imagenes.foto}" alt="Foto de ${nombreCompleto}" />` : '<div class="foto-placeholder">Sin foto</div>'}
  </div>

  <div class="datos">
    <div class="dato"><div class="etiqueta">Folio</div><div class="valor">${comensal.folio}</div></div>
    <div class="dato"><div class="etiqueta">Nombre completo</div><div class="valor">${nombreCompleto}</div></div>
    <div class="dato"><div class="etiqueta">Fecha de nacimiento</div><div class="valor">${fechaNacimientoTexto}</div></div>
    <div class="dato"><div class="etiqueta">Edad</div><div class="valor">${edad} años</div></div>
    ${comensal.curp ? `<div class="dato"><div class="etiqueta">CURP</div><div class="valor">${comensal.curp}</div></div>` : ''}
  </div>

  ${tutorHtml}

  <div class="seccion">
    <h2>Carta de uso de imagen</h2>
    <p>
      Estado: <span class="badge ${autoriza ? 'si' : 'no'}">${autoriza ? 'Autoriza' : 'No autoriza'}</span>
      ${fechaFirma ? ` — firmada el ${fechaFirma}` : ' — sin firma registrada'}
    </p>
  </div>

  ${menoresHtml}

  ${ineHtml}

  <div class="firma">
    <div class="linea">${etiquetaFirma}</div>
  </div>

  <div class="interno">
    <span>Uso interno del comedor — folio ${comensal.folio}</span>
    <span>Generado el ${fechaGeneracionTexto}</span>
  </div>
</body>
</html>`;
  }
}
