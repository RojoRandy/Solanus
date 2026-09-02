import { Injectable } from '@nestjs/common';
import { OrigenLote, Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { now } from '@/common/utils/date';
import { RegistrarEntradaDto, LoteResponseDto } from '../dto/entrada.dto';
import { validarReferenciasItem } from './crear-item.usecase';

export interface RegistrarEntradaArgs {
  dto: RegistrarEntradaDto;
  registradoPorId: number;
}

const NOMBRE_MOTIVO_POR_ORIGEN: Record<OrigenLote, string> = {
  [OrigenLote.COMPRADO]: 'Compra',
  [OrigenLote.DONADO]: 'Donación',
};

const LOTE_SELECT = {
  id: true,
  cantidadInicial: true,
  cantidadDisponible: true,
  fechaCaducidad: true,
  fechaIngreso: true,
  costoUnitario: true,
  costoTotal: true,
  origen: true,
  numeroFactura: true,
  cfdi: true,
  item: { select: { id: true, nombre: true } },
  bienhechor: { select: { id: true, nombre: true } },
} satisfies Prisma.LoteInventarioSelect;

type LoteConRelaciones = Prisma.LoteInventarioGetPayload<{
  select: typeof LOTE_SELECT;
}>;

function mapLote(lote: LoteConRelaciones): LoteResponseDto {
  return {
    id: lote.id,
    item: lote.item,
    cantidadInicial: Number(lote.cantidadInicial),
    cantidadDisponible: Number(lote.cantidadDisponible),
    fechaCaducidad: lote.fechaCaducidad,
    fechaIngreso: lote.fechaIngreso,
    costoUnitario:
      lote.costoUnitario === null ? null : Number(lote.costoUnitario),
    costoTotal: lote.costoTotal === null ? null : Number(lote.costoTotal),
    origen: lote.origen,
    bienhechor: lote.bienhechor,
    numeroFactura: lote.numeroFactura,
    cfdi: lote.cfdi,
  };
}

/**
 * Registra la entrada de un lote de inventario (compra o donación), creando el
 * InventarioItem al vuelo si no existe todavía. Crea también el MovimientoInventario
 * de auditoría correspondiente. Todo en una sola transacción de Prisma.
 */
@Injectable()
export class RegistrarEntradaUseCase implements UseCase<
  RegistrarEntradaArgs,
  LoteResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    dto,
    registradoPorId,
  }: RegistrarEntradaArgs): Promise<LoteResponseDto> {
    if (dto.cantidadInicial <= 0)
      throw InventarioErrors.Exceptions.CANTIDAD_INVALIDA({
        cantidadInicial: dto.cantidadInicial,
      });

    if (!dto.itemId && !dto.itemNuevo)
      throw InventarioErrors.Exceptions.ITEM_O_ITEM_NUEVO_REQUERIDO();

    if (dto.origen === OrigenLote.DONADO && !dto.bienhechorId)
      throw InventarioErrors.Exceptions.BIENHECHOR_REQUERIDO();

    const nombreMotivo = NOMBRE_MOTIVO_POR_ORIGEN[dto.origen];

    const lote = await this.prisma.$transaction(async (tx) => {
      let itemId = dto.itemId;

      if (itemId) {
        const item = await tx.inventarioItem.findUnique({
          where: { id: itemId },
        });
        if (!item)
          throw InventarioErrors.Exceptions.ITEM_NOT_FOUND({ id: itemId });
      } else if (dto.itemNuevo) {
        await validarReferenciasItem(tx, dto.itemNuevo);
        const itemNuevo = await tx.inventarioItem.create({
          data: {
            nombre: dto.itemNuevo.nombre,
            marca: dto.itemNuevo.marca,
            codigoBarras: dto.itemNuevo.codigoBarras,
            categoriaId: dto.itemNuevo.categoriaId,
            unidadId: dto.itemNuevo.unidadId,
            presentacion: dto.itemNuevo.presentacion,
            ubicacionId: dto.itemNuevo.ubicacionId,
            stockMinimo: dto.itemNuevo.stockMinimo ?? 0,
          },
        });
        itemId = itemNuevo.id;
      }

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
        where: { nombre: nombreMotivo },
      });
      if (!motivo)
        throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({
          nombre: nombreMotivo,
        });

      const loteCreado = await tx.loteInventario.create({
        data: {
          itemId: itemId,
          cantidadInicial: dto.cantidadInicial,
          cantidadDisponible: dto.cantidadInicial,
          fechaCaducidad: dto.fechaCaducidad
            ? new Date(dto.fechaCaducidad)
            : undefined,
          fechaIngreso: dto.fechaIngreso
            ? new Date(dto.fechaIngreso)
            : now().toDate(),
          costoUnitario: dto.costoUnitario,
          costoTotal: dto.costoTotal,
          origen: dto.origen,
          bienhechorId: dto.bienhechorId,
          numeroFactura: dto.numeroFactura,
          cfdi: dto.cfdi,
        },
        select: LOTE_SELECT,
      });

      await tx.movimientoInventario.create({
        data: {
          itemId: itemId,
          loteId: loteCreado.id,
          tipo: 'ENTRADA',
          motivoId: motivo.id,
          cantidad: dto.cantidadInicial,
          registradoPorId,
        },
      });

      return loteCreado;
    });

    return mapLote(lote);
  }
}
