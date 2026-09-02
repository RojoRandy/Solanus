import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  VOLUNTARIO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.VOLUNTARIO_NOT_FOUND(data)),
  FOTO_REQUERIDA: (data?: any) =>
    new BadRequestException(Responses.FOTO_REQUERIDA(data)),
};

const Responses = {
  VOLUNTARIO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'VOLUNTARIO_NOT_FOUND',
      'No se encontró el voluntario',
      data,
    ),
  FOTO_REQUERIDA: (data?: any) =>
    new ErrorResponseDto(
      'FOTO_REQUERIDA',
      'Debes adjuntar una fotografía',
      data,
    ),
};

export const VoluntarioErrors = { Exceptions, Responses };
