import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { InventarioItemResponseDto } from '../dto/item.dto';
import { ITEM_SELECT_CON_LOTES, mapInventarioItem } from './item.mapper';

@Injectable()
export class ObtenerInventarioItemUseCase implements UseCase<
  number,
  InventarioItemResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<InventarioItemResponseDto> {
    const item = await this.prisma.inventarioItem.findUnique({
      where: { id },
      select: ITEM_SELECT_CON_LOTES,
    });
    if (!item) throw InventarioErrors.Exceptions.ITEM_NOT_FOUND({ id });

    return mapInventarioItem(item);
  }
}
