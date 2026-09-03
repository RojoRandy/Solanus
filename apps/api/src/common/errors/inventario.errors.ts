import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  PRODUCTO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.PRODUCTO_NOT_FOUND(data)),
  PRODUCTO_DUPLICADO: (data?: any) =>
    new ConflictException(Responses.PRODUCTO_DUPLICADO(data)),
  VARIANTE_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.VARIANTE_NOT_FOUND(data)),
  VARIANTE_DUPLICADA: (data?: any) =>
    new ConflictException(Responses.VARIANTE_DUPLICADA(data)),
  MARCA_NO_PERMITIDA_EN_COCIDO: (data?: any) =>
    new BadRequestException(Responses.MARCA_NO_PERMITIDA_EN_COCIDO(data)),
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
  CATEGORIA_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.CATEGORIA_NOT_FOUND(data)),
  CATEGORIA_DUPLICADA: (data?: any) =>
    new ConflictException(Responses.CATEGORIA_DUPLICADA(data)),
  CATEGORIA_EN_USO: (data?: any) =>
    new BadRequestException(Responses.CATEGORIA_EN_USO(data)),
  UNIDAD_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.UNIDAD_NOT_FOUND(data)),
  UNIDAD_DUPLICADA: (data?: any) =>
    new ConflictException(Responses.UNIDAD_DUPLICADA(data)),
  UNIDAD_EN_USO: (data?: any) =>
    new BadRequestException(Responses.UNIDAD_EN_USO(data)),
  BIENHECHOR_REQUERIDO: (data?: any) =>
    new BadRequestException(Responses.BIENHECHOR_REQUERIDO(data)),
  PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO: (data?: any) =>
    new BadRequestException(
      Responses.PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO(data),
    ),
  MOVIMIENTO_NOT_FOUND: (data?: any) =>
    new NotFoundException(Responses.MOVIMIENTO_NOT_FOUND(data)),
  MOVIMIENTO_CAMPO_NO_EDITABLE: (data?: any) =>
    new BadRequestException(Responses.MOVIMIENTO_CAMPO_NO_EDITABLE(data)),
  AJUSTE_REQUIERE_LOTE: (data?: any) =>
    new BadRequestException(Responses.AJUSTE_REQUIERE_LOTE(data)),
  AJUSTE_CANTIDAD_CERO: (data?: any) =>
    new BadRequestException(Responses.AJUSTE_CANTIDAD_CERO(data)),
  CADUCIDAD_REQUERIDA: (data?: any) =>
    new BadRequestException(Responses.CADUCIDAD_REQUERIDA(data)),
};

const Responses = {
  PRODUCTO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'PRODUCTO_NOT_FOUND',
      'No se encontró el producto en el catálogo de inventario',
      data,
    ),
  PRODUCTO_DUPLICADO: (data?: any) =>
    new ErrorResponseDto(
      'PRODUCTO_DUPLICADO',
      'Ya existe un producto con ese nombre en la misma categoría',
      data,
    ),
  VARIANTE_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'VARIANTE_NOT_FOUND',
      'No se encontró la combinación de producto, unidad y estado indicada',
      data,
    ),
  VARIANTE_DUPLICADA: (data?: any) =>
    new ErrorResponseDto(
      'VARIANTE_DUPLICADA',
      'Ya existe esa combinación de producto, unidad y estado',
      data,
    ),
  MARCA_NO_PERMITIDA_EN_COCIDO: (data?: any) =>
    new ErrorResponseDto(
      'MARCA_NO_PERMITIDA_EN_COCIDO',
      'Un lote cocido no lleva marca',
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
  CATEGORIA_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'CATEGORIA_NOT_FOUND',
      'No se encontró la categoría de inventario',
      data,
    ),
  CATEGORIA_DUPLICADA: (data?: any) =>
    new ErrorResponseDto(
      'CATEGORIA_DUPLICADA',
      'Ya existe una categoría con ese nombre',
      data,
    ),
  CATEGORIA_EN_USO: (data?: any) =>
    new ErrorResponseDto(
      'CATEGORIA_EN_USO',
      'No se puede eliminar: hay productos que usan esta categoría',
      data,
    ),
  UNIDAD_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'UNIDAD_NOT_FOUND',
      'No se encontró la unidad de medida',
      data,
    ),
  UNIDAD_DUPLICADA: (data?: any) =>
    new ErrorResponseDto(
      'UNIDAD_DUPLICADA',
      'Ya existe una unidad de medida con ese nombre o abreviatura',
      data,
    ),
  UNIDAD_EN_USO: (data?: any) =>
    new ErrorResponseDto(
      'UNIDAD_EN_USO',
      'No se puede eliminar: hay variantes de inventario que usan esta unidad',
      data,
    ),
  BIENHECHOR_REQUERIDO: (data?: any) =>
    new ErrorResponseDto(
      'BIENHECHOR_REQUERIDO',
      'Debe indicar el bienhechor cuando el origen del lote es una donación',
      data,
    ),
  PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO: (data?: any) =>
    new ErrorResponseDto(
      'PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO',
      'Debe indicar un producto existente (productoId) o los datos de un producto nuevo (productoNuevo)',
      data,
    ),
  MOVIMIENTO_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'MOVIMIENTO_NOT_FOUND',
      'No se encontró el movimiento de inventario',
      data,
    ),
  MOVIMIENTO_CAMPO_NO_EDITABLE: (data?: any) =>
    new ErrorResponseDto(
      'MOVIMIENTO_CAMPO_NO_EDITABLE',
      'Solo se pueden editar la fecha, el motivo y las notas de un movimiento; para corregir la cantidad registra un ajuste',
      data,
    ),
  AJUSTE_REQUIERE_LOTE: (data?: any) =>
    new ErrorResponseDto(
      'AJUSTE_REQUIERE_LOTE',
      'Un ajuste que aumenta la existencia debe indicar a qué lote se aplica',
      data,
    ),
  AJUSTE_CANTIDAD_CERO: (data?: any) =>
    new ErrorResponseDto(
      'AJUSTE_CANTIDAD_CERO',
      'La cantidad del ajuste no puede ser cero',
      data,
    ),
  CADUCIDAD_REQUERIDA: (data?: any) =>
    new ErrorResponseDto(
      'CADUCIDAD_REQUERIDA',
      'Indica la fecha de caducidad o marca la casilla "No caduca"',
      data,
    ),
};

export const InventarioErrors = { Exceptions, Responses };
