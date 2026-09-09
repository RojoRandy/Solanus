import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  EVENTO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.EVENTO_NOT_FOUND(data)),
  EVENTO_PASADO_NO_EDITABLE: (data?: any) =>
    new BadRequestException(Responses.EVENTO_PASADO_NO_EDITABLE(data)),
};

const Responses = {
  EVENTO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto('EVENTO_NOT_FOUND', 'No se encontró el evento', data),
  EVENTO_PASADO_NO_EDITABLE: (data?: any) =>
    new ErrorResponseDto(
      'EVENTO_PASADO_NO_EDITABLE',
      'Los eventos pasados no se pueden editar ni dar de baja',
      data,
    ),
};

export const AgendaErrors = { Exceptions, Responses };
