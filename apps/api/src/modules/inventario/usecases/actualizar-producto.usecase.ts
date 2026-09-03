import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { ActualizarProductoDto, ProductoResponseDto } from '../dto/producto.dto';
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

  async execute({ id, dto }: ActualizarProductoArgs): Promise<ProductoResponseDto> {
    const existente = await this.prisma.producto.findUnique({ where: { id } });
    if (!existente) throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id });

    await validarCategoria(this.prisma, dto.categoriaId);

    const producto = await this.prisma.producto.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        codigoBarras: dto.codigoBarras,
        categoriaId: dto.categoriaId,
        activo: dto.activo,
      },
      select: PRODUCTO_SELECT,
    });

    return mapProducto(producto);
  }
}
