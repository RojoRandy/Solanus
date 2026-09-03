import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginatedDto, paginado, toSkipTake } from '@/common/dto/pagination.dto';
import { ListarVariantesQueryDto, VarianteResponseDto } from '../dto/variante.dto';
import { VARIANTE_SELECT_CON_LOTES, mapVariante } from './variante.mapper';

/**
 * Pantalla principal de Inventario (Existencias): una fila por combinación
 * producto × unidad × estado. `soloStockBajo` se aplica en memoria porque el
 * stock es una agregación de lotes, no una columna — con el volumen esperado
 * (cientos de variantes, no decenas de miles) es aceptable.
 */
@Injectable()
export class ListarVariantesUseCase implements UseCase<
  ListarVariantesQueryDto,
  PaginatedDto<VarianteResponseDto>
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarVariantesQueryDto = {},
  ): Promise<PaginatedDto<VarianteResponseDto>> {
    const where: Prisma.VarianteInventarioWhereInput = {
      activo: query.incluirInactivas ? undefined : true,
      productoId: query.productoId,
      unidadId: query.unidadId,
      estado: query.estado,
      producto: {
        categoriaId: query.categoriaId,
        ...(query.buscar
          ? { nombre: { contains: query.buscar, mode: 'insensitive' } }
          : {}),
      },
    };

    if (!query.soloStockBajo) {
      const { skip, take } = toSkipTake(query);
      const [variantes, total] = await Promise.all([
        this.prisma.varianteInventario.findMany({
          where,
          orderBy: { producto: { nombre: 'asc' } },
          select: VARIANTE_SELECT_CON_LOTES,
          skip,
          take,
        }),
        this.prisma.varianteInventario.count({ where }),
      ]);
      return paginado(variantes.map(mapVariante), total, query);
    }

    // "Solo stock bajo" no se puede resolver con skip/take en SQL (depende
    // de la suma de lotes), así que se filtra en memoria y se pagina después.
    const todas = await this.prisma.varianteInventario.findMany({
      where,
      orderBy: { producto: { nombre: 'asc' } },
      select: VARIANTE_SELECT_CON_LOTES,
    });
    const bajas = todas.map(mapVariante).filter((v) => v.stockBajo);
    const { skip, take } = toSkipTake(query);
    return paginado(bajas.slice(skip, skip + take), bajas.length, query);
  }
}
