import { Injectable } from '@nestjs/common';
import { OrigenLote, Prisma, Producto } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { parseFechaSoloDia } from '@/common/utils/date';
import { RegistrarEntradaDto, LoteResponseDto } from '../dto/entrada.dto';
import { validarCategoria } from './crear-producto.usecase';
import { upsertVariante } from './upsert-variante.util';

export interface RegistrarEntradaArgs {
  dto: RegistrarEntradaDto;
  registradoPorId: number;
}

const CLAVE_MOTIVO_POR_ORIGEN: Record<OrigenLote, string> = {
  [OrigenLote.COMPRADO]: 'COMPRA',
  [OrigenLote.DONADO]: 'DONACION',
};

export const LOTE_SELECT = {
  id: true,
  marca: true,
  granel: true,
  presentacion: true,
  ubicacion: true,
  cantidadInicial: true,
  cantidadDisponible: true,
  fechaCaducidad: true,
  fechaIngreso: true,
  costoUnitario: true,
  costoTotal: true,
  origen: true,
  cfdi: true,
  variante: {
    select: {
      id: true,
      estado: true,
      producto: { select: { nombre: true } },
      unidad: { select: { abrevia: true } },
    },
  },
  bienhechor: { select: { id: true, nombre: true } },
} satisfies Prisma.LoteInventarioSelect;

type LoteConRelaciones = Prisma.LoteInventarioGetPayload<{
  select: typeof LOTE_SELECT;
}>;

export function mapLote(lote: LoteConRelaciones): LoteResponseDto {
  return {
    id: lote.id,
    variante: {
      id: lote.variante.id,
      productoNombre: lote.variante.producto.nombre,
      unidadAbrevia: lote.variante.unidad.abrevia,
      estado: lote.variante.estado,
    },
    marca: lote.marca,
    granel: lote.granel,
    presentacion: lote.presentacion,
    ubicacion: lote.ubicacion,
    cantidadInicial: Number(lote.cantidadInicial),
    cantidadDisponible: Number(lote.cantidadDisponible),
    fechaCaducidad: lote.fechaCaducidad,
    fechaIngreso: lote.fechaIngreso,
    costoUnitario: lote.costoUnitario === null ? null : Number(lote.costoUnitario),
    costoTotal: lote.costoTotal === null ? null : Number(lote.costoTotal),
    origen: lote.origen,
    bienhechor: lote.bienhechor,
    cfdi: lote.cfdi,
  };
}

/**
 * Registra la entrada de un lote de inventario (compra o donación), creando
 * el Producto y/o la VarianteInventario al vuelo si no existen todavía. Crea
 * también el MovimientoInventario de auditoría. Todo en una transacción.
 */
@Injectable()
export class RegistrarEntradaUseCase implements UseCase<
  RegistrarEntradaArgs,
  LoteResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ dto, registradoPorId }: RegistrarEntradaArgs): Promise<LoteResponseDto> {
    if (dto.cantidadInicial <= 0)
      throw InventarioErrors.Exceptions.CANTIDAD_INVALIDA({ cantidadInicial: dto.cantidadInicial });

    if (!dto.productoId && !dto.productoNuevo)
      throw InventarioErrors.Exceptions.PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO();

    if (dto.origen === OrigenLote.DONADO && !dto.bienhechorId)
      throw InventarioErrors.Exceptions.BIENHECHOR_REQUERIDO();

    if (!dto.noCaduca && !dto.fechaCaducidad)
      throw InventarioErrors.Exceptions.CADUCIDAD_REQUERIDA();

    const costoTotal = dto.costoTotal ?? dto.cantidadInicial * dto.costoUnitario;
    const claveMotivo = CLAVE_MOTIVO_POR_ORIGEN[dto.origen];

    const lote = await this.prisma.$transaction(async (tx) => {
      let producto: Producto;

      if (dto.productoId) {
        const existente = await tx.producto.findUnique({ where: { id: dto.productoId } });
        if (!existente)
          throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id: dto.productoId });
        producto = existente;
      } else {
        // La validación inicial garantiza que se recibieron los datos del producto nuevo.
        const productoNuevo = dto.productoNuevo!;
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

      if (dto.bienhechorId) {
        const bienhechor = await tx.bienhechor.findUnique({ where: { id: dto.bienhechorId } });
        if (!bienhechor)
          throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({ bienhechorId: dto.bienhechorId });
      }

      const motivo = await tx.motivoMovimiento.findUnique({ where: { clave: claveMotivo } });
      if (!motivo) throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ clave: claveMotivo });

      const variante = await upsertVariante(tx, {
        productoId: producto.id,
        unidadId: producto.unidadId,
        estado: producto.estado,
      });

      const loteCreado = await tx.loteInventario.create({
        data: {
          varianteId: variante.id,
          marca: producto.granel ? null : producto.marca,
          granel: producto.granel,
          presentacion: dto.presentacion,
          ubicacion: dto.ubicacion,
          cantidadInicial: dto.cantidadInicial,
          cantidadDisponible: dto.cantidadInicial,
          fechaCaducidad: dto.noCaduca ? null : parseFechaSoloDia(dto.fechaCaducidad),
          fechaIngreso: parseFechaSoloDia(dto.fechaIngreso),
          costoUnitario: dto.costoUnitario,
          costoTotal,
          origen: dto.origen,
          bienhechorId: dto.bienhechorId,
          cfdi: dto.cfdi,
        },
        select: LOTE_SELECT,
      });

      await tx.movimientoInventario.create({
        data: {
          varianteId: variante.id,
          loteId: loteCreado.id,
          tipo: 'ENTRADA',
          motivoId: motivo.id,
          cantidad: dto.cantidadInicial,
          registradoPorId,
          // El día del movimiento se captura sin hora (se edita con un DatePicker,
          // ver actualizar-movimiento.usecase.ts) — usar now() aquí correría la
          // fecha un día después de las 18:00 hora de México al mostrarla en UTC.
          fecha: parseFechaSoloDia(),
        },
      });

      return loteCreado;
    });

    return mapLote(lote);
  }
}
