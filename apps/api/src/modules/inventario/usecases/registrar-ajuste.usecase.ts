import { Injectable } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { RegistrarAjusteDto } from '../dto/ajuste.dto';

export interface RegistrarAjusteArgs {
  dto: RegistrarAjusteDto;
  registradoPorId: number;
}

export interface RegistrarAjusteResultado {
  varianteId: number;
  cantidad: number;
  lotesAfectados: { loteId: number; cantidad: number }[];
}

/**
 * Único camino para corregir una existencia sin tocar el histórico de
 * movimientos (que es inmutable, ver actualizar-movimiento.usecase.ts).
 * Positivo: se agrega a un lote puntual (`loteId` obligatorio). Negativo: se
 * descuenta con el mismo criterio FEFO que una salida, pudiendo repartirse
 * entre varios lotes.
 */
@Injectable()
export class RegistrarAjusteUseCase implements UseCase<
  RegistrarAjusteArgs,
  RegistrarAjusteResultado
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ dto, registradoPorId }: RegistrarAjusteArgs): Promise<RegistrarAjusteResultado> {
    if (dto.cantidad === 0)
      throw InventarioErrors.Exceptions.AJUSTE_CANTIDAD_CERO();

    return this.prisma.$transaction(async (tx) => {
      const variante = await tx.varianteInventario.findUnique({ where: { id: dto.varianteId } });
      if (!variante)
        throw InventarioErrors.Exceptions.VARIANTE_NOT_FOUND({ varianteId: dto.varianteId });

      const motivo = await tx.motivoMovimiento.findUnique({ where: { id: dto.motivoId } });
      if (!motivo) throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ motivoId: dto.motivoId });

      if (dto.cantidad > 0) {
        if (!dto.loteId) throw InventarioErrors.Exceptions.AJUSTE_REQUIERE_LOTE();

        const lote = await tx.loteInventario.findUnique({ where: { id: dto.loteId } });
        if (!lote || lote.varianteId !== dto.varianteId)
          throw InventarioErrors.Exceptions.LOTE_NOT_FOUND({ loteId: dto.loteId });

        await tx.loteInventario.update({
          where: { id: lote.id },
          data: { cantidadDisponible: Number(lote.cantidadDisponible) + dto.cantidad },
        });

        await tx.movimientoInventario.create({
          data: {
            varianteId: dto.varianteId,
            loteId: lote.id,
            tipo: TipoMovimiento.AJUSTE,
            motivoId: dto.motivoId,
            cantidad: dto.cantidad,
            notas: dto.notas,
            registradoPorId,
          },
        });

        return {
          varianteId: dto.varianteId,
          cantidad: dto.cantidad,
          lotesAfectados: [{ loteId: lote.id, cantidad: dto.cantidad }],
        };
      }

      // Delta negativo: mismo reparto FEFO que una salida, pero tipado AJUSTE.
      const aDescontar = Math.abs(dto.cantidad);
      const lotesCandidatos = dto.loteId
        ? await tx.loteInventario.findMany({ where: { id: dto.loteId, varianteId: dto.varianteId } })
        : await tx.loteInventario.findMany({
            where: { varianteId: dto.varianteId, cantidadDisponible: { gt: 0 } },
            orderBy: [{ fechaCaducidad: { sort: 'asc', nulls: 'last' } }],
          });

      const disponibleTotal = lotesCandidatos.reduce(
        (total, lote) => total + Number(lote.cantidadDisponible),
        0,
      );
      if (disponibleTotal < aDescontar)
        throw InventarioErrors.Exceptions.STOCK_INSUFICIENTE({
          varianteId: dto.varianteId,
          solicitado: aDescontar,
          disponible: disponibleTotal,
        });

      let restante = aDescontar;
      const lotesAfectados: { loteId: number; cantidad: number }[] = [];

      for (const lote of lotesCandidatos) {
        if (restante <= 0) break;

        const disponibleLote = Number(lote.cantidadDisponible);
        const aQuitar = Math.min(disponibleLote, restante);

        await tx.loteInventario.update({
          where: { id: lote.id },
          data: { cantidadDisponible: disponibleLote - aQuitar },
        });

        await tx.movimientoInventario.create({
          data: {
            varianteId: dto.varianteId,
            loteId: lote.id,
            tipo: TipoMovimiento.AJUSTE,
            motivoId: dto.motivoId,
            cantidad: -aQuitar,
            notas: dto.notas,
            registradoPorId,
          },
        });

        lotesAfectados.push({ loteId: lote.id, cantidad: -aQuitar });
        restante -= aQuitar;
      }

      return { varianteId: dto.varianteId, cantidad: dto.cantidad, lotesAfectados };
    });
  }
}
