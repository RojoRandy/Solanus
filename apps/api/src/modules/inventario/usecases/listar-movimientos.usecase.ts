import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ListarMovimientosQueryDto,
  MovimientoResponseDto,
} from '../dto/movimiento.dto';

@Injectable()
export class ListarMovimientosUseCase implements UseCase<
  ListarMovimientosQueryDto,
  MovimientoResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarMovimientosQueryDto = {},
  ): Promise<MovimientoResponseDto[]> {
    const where: Prisma.MovimientoInventarioWhereInput = {
      itemId: query.itemId,
      turnoId: query.turnoId,
      tipo: query.tipo,
      fecha: {
        gte: query.desde ? new Date(query.desde) : undefined,
        lte: query.hasta ? new Date(query.hasta) : undefined,
      },
    };

    const movimientos = await this.prisma.movimientoInventario.findMany({
      where,
      orderBy: { fecha: 'desc' },
      select: {
        id: true,
        loteId: true,
        tipo: true,
        cantidad: true,
        turnoId: true,
        fecha: true,
        notas: true,
        item: { select: { id: true, nombre: true } },
        motivo: { select: { id: true, nombre: true } },
        registradoPor: { select: { id: true, nombre: true } },
      },
    });

    return movimientos.map((movimiento) => ({
      id: movimiento.id,
      item: movimiento.item,
      loteId: movimiento.loteId,
      tipo: movimiento.tipo,
      motivo: movimiento.motivo,
      cantidad: Number(movimiento.cantidad),
      turnoId: movimiento.turnoId,
      registradoPor: movimiento.registradoPor,
      fecha: movimiento.fecha,
      notas: movimiento.notas,
    }));
  }
}
