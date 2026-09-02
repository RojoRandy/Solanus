import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  CrearInventarioItemDto,
  InventarioItemResponseDto,
} from '../dto/item.dto';
import { mapInventarioItem, ITEM_SELECT_CON_LOTES } from './item.mapper';

/**
 * Valida que las referencias a catálogos (categoría, unidad, ubicación) existan antes de
 * crear/actualizar un producto. Acepta tanto el cliente normal como uno dentro de una
 * transacción (Prisma.TransactionClient), ya que PrismaService es asignable a este último.
 */
export async function validarReferenciasItem(
  prisma: Prisma.TransactionClient,
  data: {
    categoriaId?: number;
    unidadId?: number;
    ubicacionId?: number | null;
  },
): Promise<void> {
  if (data.categoriaId !== undefined) {
    const categoria = await prisma.categoriaInventario.findUnique({
      where: { id: data.categoriaId },
    });
    if (!categoria)
      throw InventarioErrors.Exceptions.CATEGORIA_NOT_FOUND({
        categoriaId: data.categoriaId,
      });
  }

  if (data.unidadId !== undefined) {
    const unidad = await prisma.unidadMedida.findUnique({
      where: { id: data.unidadId },
    });
    if (!unidad)
      throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({
        unidadId: data.unidadId,
      });
  }

  if (data.ubicacionId !== undefined && data.ubicacionId !== null) {
    const ubicacion = await prisma.ubicacion.findUnique({
      where: { id: data.ubicacionId },
    });
    if (!ubicacion)
      throw InventarioErrors.Exceptions.UBICACION_NOT_FOUND({
        ubicacionId: data.ubicacionId,
      });
  }
}

@Injectable()
export class CrearInventarioItemUseCase implements UseCase<
  CrearInventarioItemDto,
  InventarioItemResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CrearInventarioItemDto,
  ): Promise<InventarioItemResponseDto> {
    await validarReferenciasItem(this.prisma, dto);

    const item = await this.prisma.inventarioItem.create({
      data: {
        nombre: dto.nombre,
        marca: dto.marca,
        codigoBarras: dto.codigoBarras,
        categoriaId: dto.categoriaId,
        unidadId: dto.unidadId,
        presentacion: dto.presentacion,
        ubicacionId: dto.ubicacionId,
        stockMinimo: dto.stockMinimo ?? 0,
      },
      select: ITEM_SELECT_CON_LOTES,
    });

    return mapInventarioItem(item);
  }
}
