import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { now } from '@/common/utils/date';
import { ListarComensalesQueryDto } from '../dto/comensal.dto';
import { comensalListSelect, mapComensalResponse } from '../utils/comensal-select.util';
import {
  construirOrderByComensales,
  construirWhereComensales,
  LIMITE_EXPORTACION,
} from '../utils/comensal-where.util';

export interface ArchivoExportado {
  buffer: Buffer;
  filename: string;
}

const COLOR_VINO_ARGB = 'FF6B3140';

@Injectable()
export class ExportarComensalesXlsxUseCase implements UseCase<
  ListarComensalesQueryDto,
  ArchivoExportado
> {
  constructor(private readonly prisma: PrismaService) {}

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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Comedor Solanus';
    workbook.created = now().toDate();

    const hoja = workbook.addWorksheet('Comensales');
    hoja.columns = [
      { header: 'Folio', key: 'folio', width: 10 },
      { header: 'Nombres', key: 'nombres', width: 24 },
      { header: 'Apellidos', key: 'apellidos', width: 26 },
      { header: 'Fecha de nacimiento', key: 'fechaNacimiento', width: 20, style: { numFmt: 'dd/mm/yyyy' } },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'CURP', key: 'curp', width: 22 },
      { header: 'Tutor', key: 'tutor', width: 30 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Fecha de alta', key: 'createdAt', width: 16, style: { numFmt: 'dd/mm/yyyy' } },
    ];

    const encabezado = hoja.getRow(1);
    encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_VINO_ARGB } };
    encabezado.alignment = { vertical: 'middle' };
    hoja.views = [{ state: 'frozen', ySplit: 1 }];
    hoja.autoFilter = { from: 'A1', to: 'I1' };

    for (const c of comensales) {
      hoja.addRow({
        folio: c.folio,
        nombres: c.nombres,
        apellidos: c.apellidos,
        fechaNacimiento: c.fechaNacimiento,
        edad: c.edad,
        curp: c.curp ?? '',
        tutor: c.tutor ? `${c.tutor.nombres} ${c.tutor.apellidos} (folio ${c.tutor.folio})` : '',
        estado: c.activo ? 'Activo' : 'Inactivo',
        createdAt: c.createdAt,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer as ArrayBuffer),
      filename: `comensales-${now().format('YYYY-MM-DD')}.xlsx`,
    };
  }
}
