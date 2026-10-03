import { BadRequestException, ConflictException } from '@nestjs/common';
import { CierreInventario } from '@prisma/client';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  PERIODO_NO_TERMINADO: () =>
    new BadRequestException(Responses.PERIODO_NO_TERMINADO()),
  RANGO_CIERRE_INVALIDO: () =>
    new BadRequestException(Responses.RANGO_CIERRE_INVALIDO()),
  CIERRE_TRASLAPADO: (data: CierreInventario) =>
    new ConflictException(Responses.CIERRE_TRASLAPADO(data)),
  DEMASIADAS_EVIDENCIAS_PARA_PDF: (data?: any) =>
    new BadRequestException(Responses.DEMASIADAS_EVIDENCIAS_PARA_PDF(data)),
};

const Responses = {
  PERIODO_NO_TERMINADO: () =>
    new ErrorResponseDto(
      'PERIODO_NO_TERMINADO',
      'Solo se pueden cerrar periodos que ya terminaron; la fecha final debe ser anterior a hoy',
    ),
  RANGO_CIERRE_INVALIDO: () =>
    new ErrorResponseDto(
      'RANGO_CIERRE_INVALIDO',
      'La fecha inicial del cierre no puede ser posterior a la fecha final',
    ),
  CIERRE_TRASLAPADO: (data: CierreInventario) =>
    new ErrorResponseDto(
      'CIERRE_TRASLAPADO',
      'El periodo se traslapa con un cierre de inventario existente',
      data,
    ),
  DEMASIADAS_EVIDENCIAS_PARA_PDF: (data?: any) =>
    new ErrorResponseDto(
      'DEMASIADAS_EVIDENCIAS_PARA_PDF',
      'El mes tiene demasiadas evidencias para incluirlas todas en el PDF; elimina algunas o pide el reporte por partes',
      data,
    ),
};

export const ReportesErrors = { Exceptions, Responses };
