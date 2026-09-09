import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PdfService } from '@/common/pdf/pdf.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { now } from '@/common/utils/date';
import { ListarComensalesQueryDto } from '../dto/comensal.dto';
import { comensalListSelect, mapComensalResponse } from '../utils/comensal-select.util';
import {
  construirOrderByComensales,
  construirWhereComensales,
  LIMITE_EXPORTACION,
} from '../utils/comensal-where.util';
import { ArchivoExportado } from './exportar-comensales-xlsx.usecase';

const COLOR_VINO = '#6B3140';

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface FilaComensal {
  folio: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento: Date;
  edad: number;
  curp: string | null;
  tutor: { nombres: string; apellidos: string; folio: number } | null;
  activo: boolean;
}

@Injectable()
export class ExportarComensalesPdfUseCase implements UseCase<
  ListarComensalesQueryDto,
  ArchivoExportado
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async execute(query: ListarComensalesQueryDto): Promise<ArchivoExportado> {
    const filas = await this.prisma.comensal.findMany({
      where: construirWhereComensales(query),
      orderBy: construirOrderByComensales(query),
      select: comensalListSelect,
      take: LIMITE_EXPORTACION + 1,
    });
    if (filas.length > LIMITE_EXPORTACION)
      throw ComensalErrors.Exceptions.EXPORTACION_DEMASIADO_GRANDE({
        limite: LIMITE_EXPORTACION,
      });

    const comensales = filas.map(mapComensalResponse);
    const html = this.construirHtml(comensales, query);
    const buffer = await this.pdfService.render(html, {
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
    });

    return { buffer, filename: `comensales-${now().format('YYYY-MM-DD')}.pdf` };
  }

  private construirHtml(
    comensales: FilaComensal[],
    query: ListarComensalesQueryDto,
  ): string {
    const filtrosTexto = [
      query.activo === 'false' ? 'Inactivos' : 'Activos',
      query.grupoEdad === 'ninos' ? 'Niños (menores de 18)' : null,
      query.grupoEdad === 'adultos_mayores' ? 'Adultos mayores (60 o más)' : null,
      query.busqueda?.trim() ? `Búsqueda: «${escapar(query.busqueda.trim())}»` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const filasHtml = comensales
      .map((c) => {
        const tutor = c.tutor
          ? escapar(`${c.tutor.nombres} ${c.tutor.apellidos} (folio ${c.tutor.folio})`)
          : '—';
        return `<tr>
          <td>${c.folio}</td>
          <td>${escapar(`${c.nombres} ${c.apellidos}`)}</td>
          <td>${c.edad}</td>
          <td>${dayjs(c.fechaNacimiento).format('DD/MM/YYYY')}</td>
          <td>${c.curp ? escapar(c.curp) : '—'}</td>
          <td>${tutor}</td>
          <td>${c.activo ? 'Activo' : 'Inactivo'}</td>
        </tr>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2A2020; margin: 0; padding: 0; }
  .marca h1 { text-align: center; color: ${COLOR_VINO}; font-size: 20px; margin: 0 0 4px; }
  .encabezado { border-bottom: 3px solid ${COLOR_VINO}; padding-bottom: 12px; margin-bottom: 16px; }
  .encabezado h2.titulo { color: ${COLOR_VINO}; font-size: 16px; margin: 0 0 4px; }
  .encabezado p { margin: 0; color: #6B6B6B; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; }
  thead { display: table-header-group; }
  th { background: ${COLOR_VINO}; color: #fff; text-align: left; padding: 5px 6px; font-size: 9px; text-transform: uppercase; letter-spacing: .03em; }
  td { padding: 4px 6px; border-bottom: 1px solid #eee; }
  tr { break-inside: avoid; }
  tbody tr:nth-child(even) { background: #FAF7F7; }
</style>
</head>
<body>
  <div class="marca"><h1>Comedor Solanus</h1></div>
  <div class="encabezado">
    <h2 class="titulo">Listado de comensales</h2>
    <p>${escapar(filtrosTexto)} — ${comensales.length} registro${comensales.length === 1 ? '' : 's'} — generado el ${now().format('DD/MM/YYYY HH:mm')}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Folio</th>
        <th>Nombre completo</th>
        <th>Edad</th>
        <th>F. nacimiento</th>
        <th>CURP</th>
        <th>Tutor</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>${filasHtml}</tbody>
  </table>
</body>
</html>`;
  }
}
