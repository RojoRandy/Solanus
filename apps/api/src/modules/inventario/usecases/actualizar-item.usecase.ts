import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  ActualizarInventarioItemDto,
  InventarioItemResponseDto,
} from '../dto/item.dto';
import { ITEM_SELECT_CON_LOTES, mapInventarioItem } from './item.mapper';
import { validarReferenciasItem } from './crear-item.usecase';

export interface ActualizarInventarioItemArgs {
  id: number;
  dto: ActualizarInventarioItemDto;
}

@Injectable()
export class ActualizarInventarioItemUseCase implements UseCase<
  ActualizarInventarioItemArgs,
  InventarioItemResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarInventarioItemArgs): Promise<InventarioItemResponseDto> {
    const existente = await this.prisma.inventarioItem.findUnique({
      where: { id },
    });
    if (!existente) throw InventarioErrors.Exceptions.ITEM_NOT_FOUND({ id });

    await validarReferenciasItem(this.prisma, dto);

    const item = await this.prisma.inventarioItem.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        marca: dto.marca,
        codigoBarras: dto.codigoBarras,
        categoriaId: dto.categoriaId,
        unidadId: dto.unidadId,
        presentacion: dto.presentacion,
        ubicacionId: dto.ubicacionId,
        stockMinimo: dto.stockMinimo,
        activo: dto.activo,
      },
      select: ITEM_SELECT_CON_LOTES,
    });

    return mapInventarioItem(item);
  }
}
