import { Injectable } from '@nestjs/common';
import { OrigenLote } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { now } from '@/common/utils/date';
import { RegistrarDonativoDto, RegistrarDonativoResponseDto } from '../dto/donativo.dto';
import { validarCategoria } from './crear-producto.usecase';
import { upsertVariante } from './upsert-variante.util';
import { LOTE_SELECT, mapLote } from './registrar-entrada.usecase';

export interface RegistrarDonativoArgs {
  dto: RegistrarDonativoDto;
  registradoPorId: number;
}

/**
 * Registra en una sola transacción varios lotes DONADO para un mismo
 * bienhechor: el diálogo de "Registrar donativo" permite capturar más de un
 * producto sin reabrirse (§3.5 del plan de ajustes).
 */
@Injectable()
export class RegistrarDonativoUseCase implements UseCase<
  RegistrarDonativoArgs,
  RegistrarDonativoResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ dto, registradoPorId }: RegistrarDonativoArgs): Promise<RegistrarDonativoResponseDto> {
    if (dto.lineas.some((linea) => !linea.productoId && !linea.productoNuevo))
      throw InventarioErrors.Exceptions.PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO();

    const lotes = await this.prisma.$transaction(async (tx) => {
      const bienhechor = await tx.bienhechor.findUnique({ where: { id: dto.bienhechorId } });
      if (!bienhechor)
        throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({ bienhechorId: dto.bienhechorId });

      const motivo = await tx.motivoMovimiento.findUnique({ where: { clave: 'DONACION' } });
      if (!motivo) throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ clave: 'DONACION' });

      const fechaIngreso = dto.fechaIngreso ? new Date(dto.fechaIngreso) : now().toDate();
      const resultado = [];

      for (const linea of dto.lineas) {
        let productoId = linea.productoId;

        if (productoId) {
          const producto = await tx.producto.findUnique({ where: { id: productoId } });
          if (!producto) throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id: productoId });
        } else if (linea.productoNuevo) {
          await validarCategoria(tx, linea.productoNuevo.categoriaId);
          const productoNuevo = await tx.producto.create({
            data: {
              nombre: linea.productoNuevo.nombre,
              codigoBarras: linea.productoNuevo.codigoBarras,
              categoriaId: linea.productoNuevo.categoriaId,
            },
          });
          productoId = productoNuevo.id;
        }

        const variante = await upsertVariante(tx, {
          productoId: productoId!,
          unidadId: linea.unidadId,
          estado: linea.estado,
        });

        const costoTotal = linea.costoUnitario ? linea.costoUnitario * linea.cantidad : undefined;

        const lote = await tx.loteInventario.create({
          data: {
            varianteId: variante.id,
            cantidadInicial: linea.cantidad,
            cantidadDisponible: linea.cantidad,
            fechaCaducidad: linea.fechaCaducidad ? new Date(linea.fechaCaducidad) : undefined,
            fechaIngreso,
            costoUnitario: linea.costoUnitario,
            costoTotal,
            origen: OrigenLote.DONADO,
            bienhechorId: dto.bienhechorId,
          },
          select: LOTE_SELECT,
        });

        await tx.movimientoInventario.create({
          data: {
            varianteId: variante.id,
            loteId: lote.id,
            tipo: 'ENTRADA',
            motivoId: motivo.id,
            cantidad: linea.cantidad,
            registradoPorId,
          },
        });

        resultado.push(lote);
      }

      return resultado;
    });

    return { lotes: lotes.map(mapLote) };
  }
}
