import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  ActualizarProductoDto,
  ProductoResponseDto,
} from '../dto/producto.dto';
import { PRODUCTO_SELECT, mapProducto } from './producto.mapper';
import { validarCategoria } from './crear-producto.usecase';

export interface ActualizarProductoArgs {
  id: number;
  dto: ActualizarProductoDto;
}

@Injectable()
export class ActualizarProductoUseCase implements UseCase<
  ActualizarProductoArgs,
  ProductoResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarProductoArgs): Promise<ProductoResponseDto> {
    const existente = await this.prisma.producto.findUnique({ where: { id } });
    if (!existente)
      throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id });

    await validarCategoria(this.prisma, dto.categoriaId);

    let contenidoCantidad = dto.contenidoCantidad;
    let contenidoUnidadId = dto.contenidoUnidadId;
    if (
      dto.unidadId !== undefined ||
      dto.contenidoCantidad !== undefined ||
      dto.contenidoUnidadId !== undefined
    ) {
      const unidadId = dto.unidadId ?? existente.unidadId;
      const unidad = await this.prisma.unidadMedida.findUnique({
        where: { id: unidadId },
      });
      if (!unidad)
        throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({ unidadId });

      if (unidad.indicarContenido) {
        const cantidad =
          dto.contenidoCantidad !== undefined
            ? dto.contenidoCantidad
            : existente.contenidoCantidad;
        const unidadContenido =
          dto.contenidoUnidadId !== undefined
            ? dto.contenidoUnidadId
            : existente.contenidoUnidadId;
        if (cantidad == null || unidadContenido == null)
          throw InventarioErrors.Exceptions.CONTENIDO_REQUERIDO();
      } else {
        if (dto.contenidoCantidad != null || dto.contenidoUnidadId != null)
          throw InventarioErrors.Exceptions.CONTENIDO_NO_APLICA();
        // Al cambiar a una unidad sin contenido se elimina el contenido anterior.
        contenidoCantidad = null;
        contenidoUnidadId = null;
      }
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: {
        unidadId: dto.unidadId,
        estado: dto.estado,
        marca: dto.marca,
        granel: dto.granel,
        contenidoCantidad,
        contenidoUnidadId,
        nombre: dto.nombre,
        categoriaId: dto.categoriaId,
        activo: dto.activo,
      },
      select: PRODUCTO_SELECT,
    });

    return mapProducto(producto);
  }
}
