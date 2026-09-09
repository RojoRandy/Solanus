import { BadRequestException } from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  DEMASIADAS_EVIDENCIAS_PARA_PDF: (data?: any) =>
    new BadRequestException(Responses.DEMASIADAS_EVIDENCIAS_PARA_PDF(data)),
};

const Responses = {
  DEMASIADAS_EVIDENCIAS_PARA_PDF: (data?: any) =>
    new ErrorResponseDto(
      'DEMASIADAS_EVIDENCIAS_PARA_PDF',
      'El mes tiene demasiadas evidencias para incluirlas todas en el PDF; elimina algunas o pide el reporte por partes',
      data,
    ),
};

export const ReportesErrors = { Exceptions, Responses };
