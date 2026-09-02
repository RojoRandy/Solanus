import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  ERROR_UPLOADING_FILE: (data?: any) =>
    new InternalServerErrorException(Responses.ERROR_UPLOADING_FILE(data)),
  ERROR_DELETING_FILE: (data?: any) =>
    new InternalServerErrorException(Responses.ERROR_DELETING_FILE(data)),
  TIPO_ARCHIVO_NO_PERMITIDO: (data?: any) =>
    new BadRequestException(Responses.TIPO_ARCHIVO_NO_PERMITIDO(data)),
  ARCHIVO_DEMASIADO_GRANDE: (data?: any) =>
    new BadRequestException(Responses.ARCHIVO_DEMASIADO_GRANDE(data)),
};

const Responses = {
  ERROR_UPLOADING_FILE: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_UPLOADING_FILE',
      'No se pudo guardar el archivo',
      data,
    ),
  ERROR_DELETING_FILE: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_DELETING_FILE',
      'No se pudo eliminar el archivo',
      data,
    ),
  TIPO_ARCHIVO_NO_PERMITIDO: (data?: any) =>
    new ErrorResponseDto(
      'TIPO_ARCHIVO_NO_PERMITIDO',
      'El tipo de archivo no está permitido',
      data,
    ),
  ARCHIVO_DEMASIADO_GRANDE: (data?: any) =>
    new ErrorResponseDto(
      'ARCHIVO_DEMASIADO_GRANDE',
      'El archivo excede el tamaño máximo permitido',
      data,
    ),
};

export const CommonErrors = { Exceptions, Responses };
