import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { StockItemResponseDto } from '../dto/reportes.dto';

@Injectable()
export class StockItemUseCase implements UseCase<number, StockItemResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(itemId: number): Promise<StockItemResponseDto> {
    const item = await this.prisma.inventarioItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        lotes: { select: { cantidadDisponible: true } },
      },
    });
    if (!item) throw InventarioErrors.Exceptions.ITEM_NOT_FOUND({ id: itemId });

    const stockActual = item.lotes.reduce(
      (total, lote) => total + Number(lote.cantidadDisponible),
      0,
    );

    return { itemId, stockActual };
  }
}
