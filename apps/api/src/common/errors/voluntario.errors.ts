import { NotFoundException } from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  VOLUNTARIO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.VOLUNTARIO_NOT_FOUND(data)),
};

const Responses = {
  VOLUNTARIO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'VOLUNTARIO_NOT_FOUND',
      'No se encontró el voluntario',
      data,
    ),
};

export const VoluntarioErrors = { Exceptions, Responses };
