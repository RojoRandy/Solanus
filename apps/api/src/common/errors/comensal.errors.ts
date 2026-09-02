import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  COMENSAL_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.COMENSAL_NOT_FOUND(data)),
  TUTOR_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.TUTOR_NOT_FOUND(data)),
  TUTOR_DEBE_SER_MAYOR_DE_EDAD: (data?: any) =>
    new BadRequestException(Responses.TUTOR_DEBE_SER_MAYOR_DE_EDAD(data)),
  MENOR_NO_PUEDE_SER_TUTOR: (data?: any) =>
    new BadRequestException(Responses.MENOR_NO_PUEDE_SER_TUTOR(data)),
  ERROR_GENERANDO_PDF_EXPEDIENTE: (data?: any) =>
    new InternalServerErrorException(
      Responses.ERROR_GENERANDO_PDF_EXPEDIENTE(data),
    ),
};

const Responses = {
  COMENSAL_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'COMENSAL_NOT_FOUND',
      'No se encontró el comensal',
      data,
    ),
  TUTOR_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'TUTOR_NOT_FOUND',
      'No se encontró el tutor indicado',
      data,
    ),
  TUTOR_DEBE_SER_MAYOR_DE_EDAD: (data?: any) =>
    new ErrorResponseDto(
      'TUTOR_DEBE_SER_MAYOR_DE_EDAD',
      'El tutor asignado debe ser mayor de edad',
      data,
    ),
  MENOR_NO_PUEDE_SER_TUTOR: (data?: any) =>
    new ErrorResponseDto(
      'MENOR_NO_PUEDE_SER_TUTOR',
      'Un comensal menor de edad no puede ser tutor de otro',
      data,
    ),
  ERROR_GENERANDO_PDF_EXPEDIENTE: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_GENERANDO_PDF_EXPEDIENTE',
      'No se pudo generar el PDF del expediente',
      data,
    ),
};

export const ComensalErrors = { Exceptions, Responses };
