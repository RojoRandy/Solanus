import { Injectable } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ReporteInventarioResponseDto } from '../dto/reportes.dto';
import { resolverRangoFecha } from './rango-fecha.util';

export interface ReporteInventarioArgs {
  desde?: string;
  hasta?: string;
}

const MOTIVO_MERMA = 'Merma';
const MOTIVO_CADUCADO = 'Caducado';

@Injectable()
export class ReporteInventarioUseCase implements UseCase<
  ReporteInventarioArgs,
  ReporteInventarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    desde,
    hasta,
  }: ReporteInventarioArgs): Promise<ReporteInventarioResponseDto> {
    const rango = resolverRangoFecha(desde, hasta);

    const [items, movimientos] = await Promise.all([
      this.prisma.inventarioItem.findMany({
        where: { activo: true },
        select: {
          id: true,
          nombre: true,
          stockMinimo: true,
          categoria: { select: { nombre: true } },
          unidad: { select: { abrevia: true } },
          lotes: { select: { cantidadDisponible: true } },
        },
      }),
      this.prisma.movimientoInventario.findMany({
        where: { fecha: { gte: rango.desde, lte: rango.hasta } },
        select: {
          tipo: true,
          cantidad: true,
          fecha: true,
          item: { select: { nombre: true } },
          motivo: { select: { nombre: true } },
        },
      }),
    ]);

    const existencias = items
      .map((item) => {
        const stockActual = item.lotes.reduce(
          (total, lote) => total + Number(lote.cantidadDisponible),
          0,
        );
        const stockMinimo = Number(item.stockMinimo);
        return {
          itemId: item.id,
          nombre: item.nombre,
          categoria: item.categoria.nombre,
          unidad: item.unidad.abrevia,
          stockActual,
          stockMinimo,
          stockBajo: stockActual < stockMinimo,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    const movimientosPorTipo: Record<TipoMovimiento, number> = {
      ENTRADA: 0,
      SALIDA: 0,
      AJUSTE: 0,
    };
    const mermas: ReporteInventarioResponseDto['mermas'] = [];
    const caducados: ReporteInventarioResponseDto['caducados'] = [];

    for (const m of movimientos) {
      movimientosPorTipo[m.tipo] += Number(m.cantidad);

      const resumen = {
        itemNombre: m.item.nombre,
        cantidad: Number(m.cantidad),
        motivo: m.motivo.nombre,
        fecha: m.fecha,
      };
      if (m.motivo.nombre === MOTIVO_MERMA) mermas.push(resumen);
      if (m.motivo.nombre === MOTIVO_CADUCADO) caducados.push(resumen);
    }

    return { existencias, movimientosPorTipo, mermas, caducados };
  }
}
