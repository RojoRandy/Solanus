import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginatedDto, paginado, toSkipTake } from '@/common/dto/pagination.dto';
import {
  ListarMovimientosQueryDto,
  MovimientoResponseDto,
} from '../dto/movimiento.dto';

@Injectable()
export class ListarMovimientosUseCase implements UseCase<
  ListarMovimientosQueryDto,
  PaginatedDto<MovimientoResponseDto>
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarMovimientosQueryDto = {},
  ): Promise<PaginatedDto<MovimientoResponseDto>> {
    const where: Prisma.MovimientoInventarioWhereInput = {
      varianteId: query.varianteId,
      turnoId: query.turnoId,
      tipo: query.tipo,
      variante: {
        productoId: query.productoId,
        ...(query.categoriaId ? { producto: { categoriaId: query.categoriaId } } : {}),
      },
      fecha: {
        gte: query.desde ? new Date(query.desde) : undefined,
        lte: query.hasta ? new Date(query.hasta) : undefined,
      },
    };

    const { skip, take } = toSkipTake(query);
    const [movimientos, total] = await Promise.all([
      this.prisma.movimientoInventario.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take,
        select: {
          id: true,
          loteId: true,
          tipo: true,
          cantidad: true,
          turnoId: true,
          fecha: true,
          notas: true,
          editadoPorId: true,
          variante: {
            select: {
              id: true,
              estado: true,
              producto: { select: { id: true, nombre: true } },
              unidad: { select: { id: true, abrevia: true } },
            },
          },
          motivo: { select: { id: true, nombre: true } },
          registradoPor: { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.movimientoInventario.count({ where }),
    ]);

    const items = movimientos.map((movimiento) => ({
      id: movimiento.id,
      producto: movimiento.variante.producto,
      variante: {
        id: movimiento.variante.id,
        estado: movimiento.variante.estado,
        unidad: movimiento.variante.unidad,
      },
      loteId: movimiento.loteId,
      tipo: movimiento.tipo,
      motivo: movimiento.motivo,
      cantidad: Number(movimiento.cantidad),
      turnoId: movimiento.turnoId,
      registradoPor: movimiento.registradoPor,
      fecha: movimiento.fecha,
      notas: movimiento.notas,
      editado: movimiento.editadoPorId !== null,
    }));

    return paginado(items, total, query);
  }
}
