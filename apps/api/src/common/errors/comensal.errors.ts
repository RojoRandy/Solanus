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
  TUTOR_REQUERIDO_PARA_MENOR: (data?: any) =>
    new BadRequestException(Responses.TUTOR_REQUERIDO_PARA_MENOR(data)),
  MAYOR_NO_DEBE_TENER_TUTOR: (data?: any) =>
    new BadRequestException(Responses.MAYOR_NO_DEBE_TENER_TUTOR(data)),
  TUTOR_NO_PUEDE_SER_EL_MISMO_COMENSAL: (data?: any) =>
    new BadRequestException(
      Responses.TUTOR_NO_PUEDE_SER_EL_MISMO_COMENSAL(data),
    ),
  INE_SOLO_PARA_MAYORES_DE_EDAD: (data?: any) =>
    new BadRequestException(Responses.INE_SOLO_PARA_MAYORES_DE_EDAD(data)),
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
  TUTOR_REQUERIDO_PARA_MENOR: (data?: any) =>
    new ErrorResponseDto(
      'TUTOR_REQUERIDO_PARA_MENOR',
      'Un comensal menor de edad debe tener un tutor asignado',
      data,
    ),
  MAYOR_NO_DEBE_TENER_TUTOR: (data?: any) =>
    new ErrorResponseDto(
      'MAYOR_NO_DEBE_TENER_TUTOR',
      'Un comensal mayor de edad no debe tener un tutor asignado',
      data,
    ),
  TUTOR_NO_PUEDE_SER_EL_MISMO_COMENSAL: (data?: any) =>
    new ErrorResponseDto(
      'TUTOR_NO_PUEDE_SER_EL_MISMO_COMENSAL',
      'Un comensal no puede ser tutor de sí mismo',
      data,
    ),
  INE_SOLO_PARA_MAYORES_DE_EDAD: (data?: any) =>
    new ErrorResponseDto(
      'INE_SOLO_PARA_MAYORES_DE_EDAD',
      'El INE solo aplica a comensales mayores de edad',
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
