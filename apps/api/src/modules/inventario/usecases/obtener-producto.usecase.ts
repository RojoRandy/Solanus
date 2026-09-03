import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { ProductoResponseDto } from '../dto/producto.dto';
import { PRODUCTO_SELECT, mapProducto } from './producto.mapper';

@Injectable()
export class ObtenerProductoUseCase implements UseCase<number, ProductoResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<ProductoResponseDto> {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      select: PRODUCTO_SELECT,
    });
    if (!producto) throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id });

    return mapProducto(producto);
  }
}
