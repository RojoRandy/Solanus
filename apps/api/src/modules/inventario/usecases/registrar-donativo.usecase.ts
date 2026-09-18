import { Injectable } from '@nestjs/common';
import { OrigenLote, Producto } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { parseFechaSoloDia } from '@/common/utils/date';
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

      const fechaIngreso = parseFechaSoloDia(dto.fechaIngreso);
      const resultado = [];

      for (const linea of dto.lineas) {
        let producto: Producto;

        if (linea.productoId) {
          const existente = await tx.producto.findUnique({ where: { id: linea.productoId } });
          if (!existente)
            throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id: linea.productoId });
          producto = existente;
        } else {
          // La validación inicial garantiza que se recibieron los datos del producto nuevo.
          const productoNuevo = linea.productoNuevo!;
          await validarCategoria(tx, productoNuevo.categoriaId);
          const unidad = await tx.unidadMedida.findUnique({
            where: { id: productoNuevo.unidadId },
          });
          if (!unidad)
            throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({
              unidadId: productoNuevo.unidadId,
            });

          if (unidad.indicarContenido) {
            if (productoNuevo.contenidoCantidad == null || productoNuevo.contenidoUnidadId == null)
              throw InventarioErrors.Exceptions.CONTENIDO_REQUERIDO();
          } else if (productoNuevo.contenidoCantidad != null || productoNuevo.contenidoUnidadId != null) {
            throw InventarioErrors.Exceptions.CONTENIDO_NO_APLICA();
          }

          producto = await tx.producto.create({
            data: {
              nombre: productoNuevo.nombre,
              categoriaId: productoNuevo.categoriaId,
              unidadId: productoNuevo.unidadId,
              estado: productoNuevo.estado,
              marca: productoNuevo.marca ?? null,
              granel: productoNuevo.granel ?? false,
              contenidoCantidad: productoNuevo.contenidoCantidad ?? null,
              contenidoUnidadId: productoNuevo.contenidoUnidadId ?? null,
            },
          });
        }

        const variante = await upsertVariante(tx, {
          productoId: producto.id,
          unidadId: producto.unidadId,
          estado: producto.estado,
        });

        const costoTotal = linea.costoUnitario ? linea.costoUnitario * linea.cantidad : undefined;

        const lote = await tx.loteInventario.create({
          data: {
            varianteId: variante.id,
            marca: producto.granel ? null : producto.marca,
            granel: producto.granel,
            cantidadInicial: linea.cantidad,
            cantidadDisponible: linea.cantidad,
            fechaCaducidad: linea.fechaCaducidad ? parseFechaSoloDia(linea.fechaCaducidad) : undefined,
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
            // Ver el mismo comentario en registrar-entrada.usecase.ts.
            fecha: parseFechaSoloDia(),
          },
        });

        resultado.push(lote);
      }

      return resultado;
    });

    return { lotes: lotes.map(mapLote) };
  }
}
