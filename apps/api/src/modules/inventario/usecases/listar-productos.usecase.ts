import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginatedDto, paginado, toSkipTake } from '@/common/dto/pagination.dto';
import { ListarProductosQueryDto, ProductoResponseDto } from '../dto/producto.dto';
import { PRODUCTO_SELECT, mapProducto } from './producto.mapper';

@Injectable()
export class ListarProductosUseCase implements UseCase<
  ListarProductosQueryDto,
  PaginatedDto<ProductoResponseDto>
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarProductosQueryDto = {},
  ): Promise<PaginatedDto<ProductoResponseDto>> {
    const where: Prisma.ProductoWhereInput = {
      activo: query.incluirInactivos ? undefined : true,
      categoriaId: query.categoriaId,
      ...(query.buscar
        ? { nombre: { contains: query.buscar, mode: 'insensitive' } }
        : {}),
    };

    const { skip, take } = toSkipTake(query);
    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        orderBy: { nombre: 'asc' },
        select: PRODUCTO_SELECT,
        skip,
        take,
      }),
      this.prisma.producto.count({ where }),
    ]);

    return paginado(productos.map(mapProducto), total, query);
  }
}
