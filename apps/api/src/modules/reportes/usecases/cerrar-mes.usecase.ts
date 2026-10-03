import { Injectable } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { ReportesErrors } from '@/common/errors/reportes.errors';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { parseFechaSoloDia } from '@/common/utils/date';
import { PrismaService } from '@/prisma/prisma.service';
import { CerrarMesDto, CierreInventarioResponseDto } from '../dto/reportes.dto';

export interface CerrarMesArgs {
  dto: CerrarMesDto;
  cerradoPorId: number;
}

/** Cierra un periodo y deja las existencias en cero con ajustes auditables en una transacción. */
@Injectable()
export class CerrarMesUseCase implements UseCase<CerrarMesArgs, CierreInventarioResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ dto, cerradoPorId }: CerrarMesArgs): Promise<CierreInventarioResponseDto> {
    const desde = parseFechaSoloDia(dto.desde);
    const hasta = parseFechaSoloDia(dto.hasta);
    if (desde > hasta) throw ReportesErrors.Exceptions.RANGO_CIERRE_INVALIDO();
    if (hasta >= parseFechaSoloDia())
      throw ReportesErrors.Exceptions.PERIODO_NO_TERMINADO();

    return this.prisma.$transaction(async (tx) => {
      const existente = await tx.cierreInventario.findFirst({
        where: { desde: { lte: hasta }, hasta: { gte: desde } },
      });
      if (existente) throw ReportesErrors.Exceptions.CIERRE_TRASLAPADO(existente);

      const motivo = await tx.motivoMovimiento.findUnique({ where: { clave: 'CIERRE_MES' } });
      if (!motivo) throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ clave: 'CIERRE_MES' });

      const lotes = await tx.loteInventario.findMany({
        where: { cantidadDisponible: { gt: 0 } },
      });
      const formatoDia = (fecha: Date) => fecha.toISOString().slice(0, 10).split('-').reverse().join('/');
      const notas = `Cierre del ${formatoDia(desde)} al ${formatoDia(hasta)}`;

      if (lotes.length > 0) {
        await tx.movimientoInventario.createMany({
          data: lotes.map((lote) => ({
            varianteId: lote.varianteId,
            loteId: lote.id,
            tipo: TipoMovimiento.AJUSTE,
            motivoId: motivo.id,
            cantidad: lote.cantidadDisponible.negated(),
            fecha: hasta,
            registradoPorId: cerradoPorId,
            notas,
          })),
        });
        await tx.loteInventario.updateMany({
          where: { id: { in: lotes.map((lote) => lote.id) } },
          data: { cantidadDisponible: 0 },
        });
      }

      const cierre = await tx.cierreInventario.create({
        data: { desde, hasta, cerradoPorId },
      });
      return { id: cierre.id, desde: cierre.desde, hasta: cierre.hasta, lotesAjustados: lotes.length };
    });
  }
}
