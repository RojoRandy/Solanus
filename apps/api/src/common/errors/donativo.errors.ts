import { NotFoundException } from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  DONATIVO_DINERO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.DONATIVO_DINERO_NOT_FOUND(data)),
};

const Responses = {
  DONATIVO_DINERO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'DONATIVO_DINERO_NOT_FOUND',
      'No se encontró el donativo en dinero',
      data,
    ),
};

export const DonativoErrors = { Exceptions, Responses };
