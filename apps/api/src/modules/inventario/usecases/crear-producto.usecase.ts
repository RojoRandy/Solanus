import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { CrearProductoDto, ProductoResponseDto } from '../dto/producto.dto';
import { PRODUCTO_SELECT, mapProducto } from './producto.mapper';

/** Valida que la categoría exista antes de crear/actualizar un producto. */
export async function validarCategoria(
  prisma: Prisma.TransactionClient,
  categoriaId: number | undefined,
): Promise<void> {
  if (categoriaId === undefined) return;
  const categoria = await prisma.categoriaInventario.findUnique({ where: { id: categoriaId } });
  if (!categoria) throw InventarioErrors.Exceptions.CATEGORIA_NOT_FOUND({ categoriaId });
}

@Injectable()
export class CrearProductoUseCase implements UseCase<CrearProductoDto, ProductoResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearProductoDto): Promise<ProductoResponseDto> {
    await validarCategoria(this.prisma, dto.categoriaId);

    const existente = await this.prisma.producto.findFirst({
      where: { nombre: dto.nombre, categoriaId: dto.categoriaId },
    });
    if (existente)
      throw InventarioErrors.Exceptions.PRODUCTO_DUPLICADO({
        nombre: dto.nombre,
        categoriaId: dto.categoriaId,
      });

    const producto = await this.prisma.producto.create({
      data: {
        nombre: dto.nombre,
        codigoBarras: dto.codigoBarras,
        categoriaId: dto.categoriaId,
      },
      select: PRODUCTO_SELECT,
    });

    return mapProducto(producto);
  }
}
