import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InventarioItemResponseDto,
  ListarInventarioItemsQueryDto,
} from '../dto/item.dto';
import { ITEM_SELECT_CON_LOTES, mapInventarioItem } from './item.mapper';

@Injectable()
export class ListarInventarioItemsUseCase implements UseCase<
  ListarInventarioItemsQueryDto,
  InventarioItemResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarInventarioItemsQueryDto = {},
  ): Promise<InventarioItemResponseDto[]> {
    const where: Prisma.InventarioItemWhereInput = {
      activo: query.incluirInactivos ? undefined : true,
      ...(query.buscar
        ? {
            OR: [
              { nombre: { contains: query.buscar, mode: 'insensitive' } },
              { marca: { contains: query.buscar, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const items = await this.prisma.inventarioItem.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: ITEM_SELECT_CON_LOTES,
    });

    return items.map(mapInventarioItem);
  }
}
