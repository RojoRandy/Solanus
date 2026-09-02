import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  ITEM_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.ITEM_NOT_FOUND(data)),
  LOTE_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.LOTE_NOT_FOUND(data)),
  BIENHECHOR_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.BIENHECHOR_NOT_FOUND(data)),
  MOTIVO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.MOTIVO_NOT_FOUND(data)),
  STOCK_INSUFICIENTE: (data?: any) =>
    new BadRequestException(Responses.STOCK_INSUFICIENTE(data)),
  CANTIDAD_INVALIDA: (data?: any) =>
    new BadRequestException(Responses.CANTIDAD_INVALIDA(data)),
  ERROR_REGISTRANDO_MOVIMIENTO: (data?: any) =>
    new InternalServerErrorException(
      Responses.ERROR_REGISTRANDO_MOVIMIENTO(data),
    ),
};

const Responses = {
  ITEM_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'ITEM_NOT_FOUND',
      'No se encontró el producto en el catálogo de inventario',
      data,
    ),
  LOTE_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'LOTE_NOT_FOUND',
      'No se encontró el lote de inventario',
      data,
    ),
  BIENHECHOR_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'BIENHECHOR_NOT_FOUND',
      'No se encontró el bienhechor',
      data,
    ),
  MOTIVO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'MOTIVO_NOT_FOUND',
      'No se encontró el motivo de movimiento',
      data,
    ),
  STOCK_INSUFICIENTE: (data?: any) =>
    new ErrorResponseDto(
      'STOCK_INSUFICIENTE',
      'No hay existencia suficiente para descontar la cantidad solicitada',
      data,
    ),
  CANTIDAD_INVALIDA: (data?: any) =>
    new ErrorResponseDto(
      'CANTIDAD_INVALIDA',
      'La cantidad debe ser mayor a cero',
      data,
    ),
  ERROR_REGISTRANDO_MOVIMIENTO: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_REGISTRANDO_MOVIMIENTO',
      'No se pudo registrar el movimiento de inventario',
      data,
    ),
};

export const InventarioErrors = { Exceptions, Responses };
