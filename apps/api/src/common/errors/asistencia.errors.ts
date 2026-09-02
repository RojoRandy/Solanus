import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  TURNO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.TURNO_NOT_FOUND(data)),
  ASISTENCIA_YA_REGISTRADA: (data?: any) =>
    new BadRequestException(Responses.ASISTENCIA_YA_REGISTRADA(data)),
  ASISTENCIA_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.ASISTENCIA_NOT_FOUND(data)),
  COMENSAL_INACTIVO: (data?: any) =>
    new BadRequestException(Responses.COMENSAL_INACTIVO(data)),
  VOLUNTARIO_INACTIVO: (data?: any) =>
    new BadRequestException(Responses.VOLUNTARIO_INACTIVO(data)),
  VOLUNTARIO_YA_ASIGNADO: (data?: any) =>
    new BadRequestException(Responses.VOLUNTARIO_YA_ASIGNADO(data)),
  VOLUNTARIO_NO_ASIGNADO: (data?: any) =>
    new NotFoundException(Responses.VOLUNTARIO_NO_ASIGNADO(data)),
  ERROR_REGISTRANDO_TURNO: (data?: any) =>
    new InternalServerErrorException(Responses.ERROR_REGISTRANDO_TURNO(data)),
};

const Responses = {
  TURNO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'TURNO_NOT_FOUND',
      'No se encontró el turno de comida',
      data,
    ),
  ASISTENCIA_YA_REGISTRADA: (data?: any) =>
    new ErrorResponseDto(
      'ASISTENCIA_YA_REGISTRADA',
      'El comensal ya tiene asistencia registrada en este turno',
      data,
    ),
  ASISTENCIA_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'ASISTENCIA_NOT_FOUND',
      'No se encontró el registro de asistencia',
      data,
    ),
  COMENSAL_INACTIVO: (data?: any) =>
    new ErrorResponseDto(
      'COMENSAL_INACTIVO',
      'El comensal está dado de baja',
      data,
    ),
  VOLUNTARIO_INACTIVO: (data?: any) =>
    new ErrorResponseDto(
      'VOLUNTARIO_INACTIVO',
      'El voluntario está dado de baja',
      data,
    ),
  VOLUNTARIO_YA_ASIGNADO: (data?: any) =>
    new ErrorResponseDto(
      'VOLUNTARIO_YA_ASIGNADO',
      'El voluntario ya está asignado a este turno',
      data,
    ),
  VOLUNTARIO_NO_ASIGNADO: (data?: any) =>
    new ErrorResponseDto(
      'VOLUNTARIO_NO_ASIGNADO',
      'El voluntario no está asignado a este turno',
      data,
    ),
  ERROR_REGISTRANDO_TURNO: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_REGISTRANDO_TURNO',
      'No se pudo registrar el turno de comida',
      data,
    ),
};

export const AsistenciaErrors = { Exceptions, Responses };
