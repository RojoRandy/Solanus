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
  ERROR_REGISTRANDO_TURNO: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_REGISTRANDO_TURNO',
      'No se pudo registrar el turno de comida',
      data,
    ),
};

export const AsistenciaErrors = { Exceptions, Responses };
