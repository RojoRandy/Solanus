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

    const [variantes, movimientos] = await Promise.all([
      this.prisma.varianteInventario.findMany({
        where: { activo: true },
        select: {
          id: true,
          estado: true,
          stockMinimo: true,
          producto: { select: { nombre: true, categoria: { select: { nombre: true } } } },
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
          variante: { select: { producto: { select: { nombre: true } }, unidad: { select: { abrevia: true } } } },
          motivo: { select: { nombre: true, clave: true, esMerma: true } },
        },
      }),
    ]);

    const existencias = variantes
      .map((variante) => {
        const stockActual = variante.lotes.reduce(
          (total, lote) => total + Number(lote.cantidadDisponible),
          0,
        );
        const stockMinimo = Number(variante.stockMinimo);
        return {
          varianteId: variante.id,
          nombre: variante.producto.nombre,
          categoria: variante.producto.categoria.nombre,
          unidad: variante.unidad.abrevia,
          estado: variante.estado,
          stockActual,
          stockMinimo,
          stockBajo: stockActual < stockMinimo,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    let entradas = 0;
    let salidas = 0;
    let ajustesPositivos = 0;
    let ajustesNegativos = 0;
    const mermas: ReporteInventarioResponseDto['mermas'] = [];
    const caducados: ReporteInventarioResponseDto['caducados'] = [];

    for (const m of movimientos) {
      const cantidad = Number(m.cantidad);

      if (m.tipo === TipoMovimiento.ENTRADA) entradas += cantidad;
      else if (m.tipo === TipoMovimiento.SALIDA) salidas += cantidad;
      else if (cantidad > 0) ajustesPositivos += cantidad;
      else ajustesNegativos += Math.abs(cantidad);

      const resumen = {
        productoNombre: m.variante.producto.nombre,
        unidad: m.variante.unidad.abrevia,
        cantidad,
        motivo: m.motivo.nombre,
        fecha: m.fecha,
      };
      // La merma se identifica por la clave del motivo, no por su nombre (que
      // es editable desde Configuración) — así no se rompe si se renombra.
      if (m.motivo.esMerma) mermas.push(resumen);
      if (m.motivo.clave === 'CADUCADO') caducados.push(resumen);
    }

    return {
      existencias,
      movimientosPorTipo: {
        entradas,
        salidas,
        ajustesPositivos,
        ajustesNegativos,
        ajusteNeto: ajustesPositivos - ajustesNegativos,
      },
      mermas,
      caducados,
    };
  }
}
