import { Inject, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
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
import { calcularEdad } from '../utils/edad.util';
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
      select: comensalDetalleSelect,
    });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    try {
      const fotoDataUri = await this.fotoComoDataUri(comensal.fotoPath);
      const html = this.construirHtml(comensal, fotoDataUri);
      const buffer = await this.pdfService.render(html);

      return { buffer, filename: `expediente-${comensal.folio}.pdf` };
    } catch (error) {
      throw ComensalErrors.Exceptions.ERROR_GENERANDO_PDF_EXPEDIENTE({
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async fotoComoDataUri(
    fotoPath: string | null,
  ): Promise<string | null> {
    if (!fotoPath) return null;
    const absolutePath = this.storage.resolveAbsolutePath(fotoPath);
    const extension = path.extname(absolutePath).toLowerCase();
    const mime = MIME_POR_EXTENSION[extension] ?? 'image/jpeg';

    try {
      const buffer = await fs.readFile(absolutePath);
      return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch {
      return null;
    }
  }

  private construirHtml(
    comensal: {
      folio: number;
      nombres: string;
      apellidos: string;
      fechaNacimiento: Date;
      curp: string | null;
      menores: { folio: number; nombres: string; apellidos: string }[];
      cartaUsoImagen: { autoriza: boolean; fechaFirma: Date | null } | null;
    },
    fotoDataUri: string | null,
  ): string {
    const nombreCompleto = `${comensal.nombres} ${comensal.apellidos}`;
    const edad = calcularEdad(comensal.fechaNacimiento);
    const fechaNacimientoTexto = dayjs(comensal.fechaNacimiento).format(
      'DD/MM/YYYY',
    );
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
              .map(
                (m) =>
                  `<li>Folio ${m.folio} — ${m.nombres} ${m.apellidos}</li>`,
              )
              .join('')}
          </ul>
        </div>`
      : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2A2020; margin: 0; padding: 0; }
  .encabezado { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${COLOR_VINO}; padding-bottom: 16px; margin-bottom: 20px; }
  .encabezado h1 { color: ${COLOR_VINO}; font-size: 22px; margin: 0 0 4px; }
  .encabezado p { margin: 0; color: #6B6B6B; font-size: 12px; }
  .foto { width: 100px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
  .foto-placeholder { width: 100px; height: 120px; border-radius: 6px; border: 1px dashed #bbb; display: flex; align-items: center; justify-content: center; color: #999; font-size: 11px; text-align: center; }
  .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-bottom: 18px; }
  .dato .etiqueta { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #8A8A8A; margin-bottom: 2px; }
  .dato .valor { font-size: 14px; font-weight: 600; }
  .seccion { margin-bottom: 18px; }
  .seccion h2 { font-size: 13px; color: ${COLOR_VINO}; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; }
  .seccion ul { margin: 0; padding-left: 18px; font-size: 13px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge.si { background: #E4EDE1; color: #3E6B3A; }
  .badge.no { background: #F3E2E2; color: #8A2E2E; }
  .firma { margin-top: 40px; display: flex; gap: 40px; }
  .firma .linea { flex: 1; border-top: 1px solid #444; padding-top: 6px; font-size: 11px; color: #6B6B6B; text-align: center; }
  .interno { margin-top: 40px; border-top: 1px dashed #bbb; padding-top: 10px; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="encabezado">
    <div>
      <h1>Expediente de comensal</h1>
      <p>Comedor Solanus — folio ${comensal.folio}</p>
    </div>
    ${fotoDataUri ? `<img class="foto" src="${fotoDataUri}" alt="Foto de ${nombreCompleto}" />` : '<div class="foto-placeholder">Sin foto</div>'}
  </div>

  <div class="datos">
    <div class="dato"><div class="etiqueta">Folio</div><div class="valor">${comensal.folio}</div></div>
    <div class="dato"><div class="etiqueta">Nombre completo</div><div class="valor">${nombreCompleto}</div></div>
    <div class="dato"><div class="etiqueta">Fecha de nacimiento</div><div class="valor">${fechaNacimientoTexto}</div></div>
    <div class="dato"><div class="etiqueta">Edad</div><div class="valor">${edad} años</div></div>
    ${comensal.curp ? `<div class="dato"><div class="etiqueta">CURP</div><div class="valor">${comensal.curp}</div></div>` : ''}
  </div>

  <div class="seccion">
    <h2>Carta de uso de imagen</h2>
    <p>
      Estado: <span class="badge ${autoriza ? 'si' : 'no'}">${autoriza ? 'Autoriza' : 'No autoriza'}</span>
      ${fechaFirma ? ` — firmada el ${fechaFirma}` : ' — sin firma registrada'}
    </p>
  </div>

  ${menoresHtml}

  <div class="firma">
    <div class="linea">Firma de autorización de uso de imagen</div>
  </div>

  <div class="interno">
    <span>Uso interno del comedor — folio ${comensal.folio}</span>
    <span>Generado el ${fechaGeneracionTexto}</span>
  </div>
</body>
</html>`;
  }
}
