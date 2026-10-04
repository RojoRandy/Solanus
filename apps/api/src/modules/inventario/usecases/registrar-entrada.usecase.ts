import { Injectable } from '@nestjs/common';
import { OrigenLote, Prisma, Producto } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { parseFechaSoloDia } from '@/common/utils/date';
import { validarPeriodoAbierto } from './periodo-cerrado.util';
import {
  RegistrarEntradaDto,
  RegistrarEntradaResponseDto,
  LineaEntradaDto,
  LoteResponseDto,
} from '../dto/entrada.dto';
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
  entrada: { select: { id: true, cfdi: true } },
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
    costoUnitario:
      lote.costoUnitario === null ? null : Number(lote.costoUnitario),
    costoTotal: lote.costoTotal === null ? null : Number(lote.costoTotal),
    origen: lote.origen,
    bienhechor: lote.bienhechor,
    entradaId: lote.entrada.id,
    cfdi: lote.entrada.cfdi,
  };
}

/** Obtiene el producto existente o lo crea con los datos de la línea. */
async function obtenerOCrearProducto(
  tx: Prisma.TransactionClient,
  linea: LineaEntradaDto,
): Promise<Producto> {
  let producto: Producto;

  if (linea.productoId) {
    const existente = await tx.producto.findUnique({
      where: { id: linea.productoId },
    });
    if (!existente)
      throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({
        id: linea.productoId,
      });
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
      if (
        productoNuevo.contenidoCantidad == null ||
        productoNuevo.contenidoUnidadId == null
      )
        throw InventarioErrors.Exceptions.CONTENIDO_REQUERIDO();
    } else if (
      productoNuevo.contenidoCantidad != null ||
      productoNuevo.contenidoUnidadId != null
    ) {
      throw InventarioErrors.Exceptions.CONTENIDO_NO_APLICA();
    }

    producto = await tx.producto.create({
      data: {
        nombre: productoNuevo.nombre,
        claveSat: productoNuevo.claveSat ?? null,
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
  return producto;
}

/** Registra una entrada multiproducto y sus movimientos en una sola transacción. */
@Injectable()
export class RegistrarEntradaUseCase implements UseCase<
  RegistrarEntradaArgs,
  RegistrarEntradaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    dto,
    registradoPorId,
  }: RegistrarEntradaArgs): Promise<RegistrarEntradaResponseDto> {
    if (dto.lineas.some((linea) => !linea.productoId && !linea.productoNuevo))
      throw InventarioErrors.Exceptions.PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO();

    if (dto.origen === OrigenLote.DONADO && !dto.bienhechorId)
      throw InventarioErrors.Exceptions.BIENHECHOR_REQUERIDO();

    if (
      dto.origen === OrigenLote.COMPRADO &&
      dto.lineas.some((linea) => linea.costoUnitario == null)
    )
      throw InventarioErrors.Exceptions.COSTO_UNITARIO_REQUERIDO();

    for (const linea of dto.lineas) {
      if (linea.cantidad <= 0)
        throw InventarioErrors.Exceptions.CANTIDAD_INVALIDA({
          cantidad: linea.cantidad,
        });
      if (!linea.noCaduca && !linea.fechaCaducidad)
        throw InventarioErrors.Exceptions.CADUCIDAD_REQUERIDA();
    }

    const claveMotivo = CLAVE_MOTIVO_POR_ORIGEN[dto.origen];
    return this.prisma.$transaction(async (tx) => {
      if (dto.bienhechorId) {
        const bienhechor = await tx.bienhechor.findUnique({
          where: { id: dto.bienhechorId },
        });
        if (!bienhechor)
          throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({
            bienhechorId: dto.bienhechorId,
          });
      }

      const motivo = await tx.motivoMovimiento.findUnique({
        where: { clave: claveMotivo },
      });
      if (!motivo)
        throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({
          clave: claveMotivo,
        });

      const fechaIngreso = parseFechaSoloDia(dto.fechaIngreso);
      await validarPeriodoAbierto(tx, fechaIngreso);

      const entrada = await tx.entradaInventario.create({
        data: {
          fechaIngreso,
          origen: dto.origen,
          bienhechorId: dto.bienhechorId,
          cfdi: dto.cfdi,
        },
      });
      const lotes: LoteResponseDto[] = [];

      for (const linea of dto.lineas) {
        const producto = await obtenerOCrearProducto(tx, linea);
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
            entradaId: entrada.id,
            ubicacion: dto.ubicacion,
            cantidadInicial: linea.cantidad,
            cantidadDisponible: linea.cantidad,
            fechaCaducidad: linea.noCaduca
              ? null
              : parseFechaSoloDia(linea.fechaCaducidad),
            fechaIngreso: entrada.fechaIngreso,
            costoUnitario: linea.costoUnitario,
            costoTotal: linea.costoUnitario
              ? linea.cantidad * linea.costoUnitario
              : null,
            origen: entrada.origen,
            bienhechorId: entrada.bienhechorId,
          },
          select: LOTE_SELECT,
        });

        await tx.movimientoInventario.create({
          data: {
            varianteId: variante.id,
            loteId: loteCreado.id,
            tipo: 'ENTRADA',
            motivoId: motivo.id,
            cantidad: linea.cantidad,
            registradoPorId,
            // El movimiento de entrada lleva la fecha de ingreso para que
            // reportes y cierres lo ubiquen en el periodo correcto.
            fecha: fechaIngreso,
          },
        });

        lotes.push(mapLote(loteCreado));
      }
      return { entradaId: entrada.id, lotes };
    });
  }
}
