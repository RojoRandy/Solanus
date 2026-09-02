import { Injectable } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';

export interface RegistrarSalidaArgs {
  itemId: number;
  cantidad: number;
  motivoId: number;
  turnoId?: number;
  registradoPorId: number;
  notas?: string;
}

export interface RegistrarSalidaResultado {
  itemId: number;
  cantidadDescontada: number;
  lotesAfectados: { loteId: number; cantidad: number }[];
}

/**
 * Descuenta existencia de inventario para un producto, consumiendo lotes en orden
 * FEFO (primero en caducar, primero en salir; los sin fecha de caducidad se consumen
 * al final). Genera un MovimientoInventario de tipo SALIDA por cada lote afectado.
 *
 * Reutilizable: además del endpoint manual (mermas/ajustes), el módulo de Asistencia
 * (Fase 3) invoca esta clase directamente para descontar inventario al servir comidas.
 */
@Injectable()
export class RegistrarSalidaInventarioUseCase implements UseCase<
  RegistrarSalidaArgs,
  RegistrarSalidaResultado
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(args: RegistrarSalidaArgs): Promise<RegistrarSalidaResultado> {
    const { itemId, cantidad, motivoId, turnoId, registradoPorId, notas } =
      args;

    if (cantidad <= 0)
      throw InventarioErrors.Exceptions.CANTIDAD_INVALIDA({ cantidad });

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventarioItem.findUnique({
        where: { id: itemId },
      });
      if (!item) throw InventarioErrors.Exceptions.ITEM_NOT_FOUND({ itemId });

      const motivo = await tx.motivoMovimiento.findUnique({
        where: { id: motivoId },
      });
      if (!motivo)
        throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ motivoId });

      const lotes = await tx.loteInventario.findMany({
        where: { itemId, cantidadDisponible: { gt: 0 } },
        orderBy: [{ fechaCaducidad: { sort: 'asc', nulls: 'last' } }],
      });

      const disponibleTotal = lotes.reduce(
        (total, lote) => total + Number(lote.cantidadDisponible),
        0,
      );
      if (disponibleTotal < cantidad)
        throw InventarioErrors.Exceptions.STOCK_INSUFICIENTE({
          itemId,
          solicitado: cantidad,
          disponible: disponibleTotal,
        });

      let restante = cantidad;
      const lotesAfectados: { loteId: number; cantidad: number }[] = [];

      for (const lote of lotes) {
        if (restante <= 0) break;

        const disponibleLote = Number(lote.cantidadDisponible);
        const aDescontar = Math.min(disponibleLote, restante);

        await tx.loteInventario.update({
          where: { id: lote.id },
          data: { cantidadDisponible: disponibleLote - aDescontar },
        });

        await tx.movimientoInventario.create({
          data: {
            itemId,
            loteId: lote.id,
            tipo: TipoMovimiento.SALIDA,
            motivoId,
            cantidad: aDescontar,
            turnoId,
            registradoPorId,
            notas,
          },
        });

        lotesAfectados.push({ loteId: lote.id, cantidad: aDescontar });
        restante -= aDescontar;
      }

      return {
        itemId,
        cantidadDescontada: cantidad,
        lotesAfectados,
      };
    });
  }
}
