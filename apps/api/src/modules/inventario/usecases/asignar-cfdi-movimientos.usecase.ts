import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  AsignarCfdiMovimientosDto,
  AsignarCfdiMovimientosResponseDto,
} from '../dto/movimiento.dto';
import { validarPeriodoAbierto } from './periodo-cerrado.util';

/**
 * El CFDI vive en la entrada (lote) del movimiento. Todos los movimientos deben
 * ser del mismo bienhechor y ni ellos ni su entrada pueden caer en un periodo cerrado.
 */
@Injectable()
export class AsignarCfdiMovimientosUseCase implements UseCase<
  AsignarCfdiMovimientosDto,
  AsignarCfdiMovimientosResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: AsignarCfdiMovimientosDto,
  ): Promise<AsignarCfdiMovimientosResponseDto> {
    const ids = [...new Set(dto.movimientoIds)];
    const movimientos = await this.prisma.movimientoInventario.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        fecha: true,
        lote: {
          select: {
            entradaId: true,
            bienhechorId: true,
            entrada: { select: { fechaIngreso: true } },
          },
        },
      },
    });

    const encontrados = new Set(movimientos.map((m) => m.id));
    const faltantes = ids.filter((id) => !encontrados.has(id));
    if (faltantes.length)
      throw InventarioErrors.Exceptions.MOVIMIENTO_NOT_FOUND({
        ids: faltantes,
      });

    const sinLote = movimientos.filter((m) => !m.lote).map((m) => m.id);
    if (sinLote.length)
      throw InventarioErrors.Exceptions.MOVIMIENTO_SIN_LOTE({ ids: sinLote });

    const lotes = movimientos.flatMap((m) => (m.lote ? [m.lote] : []));
    if (new Set(lotes.map((l) => l.bienhechorId)).size > 1)
      throw InventarioErrors.Exceptions.CFDI_BIENHECHORES_DISTINTOS();

    const fechas = [
      ...movimientos.map((m) => m.fecha),
      ...lotes.map((l) => l.entrada.fechaIngreso),
    ];
    for (const fecha of fechas) await validarPeriodoAbierto(this.prisma, fecha);

    const entradas = [...new Set(lotes.map((l) => l.entradaId))];
    const cfdi = dto.cfdi?.trim() || null;
    await this.prisma.entradaInventario.updateMany({
      where: { id: { in: entradas } },
      data: { cfdi },
    });
    return { entradas, cfdi };
  }
}
