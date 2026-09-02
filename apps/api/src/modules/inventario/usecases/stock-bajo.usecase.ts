import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { StockBajoResponseDto } from '../dto/reportes.dto';

/** Lo usa el Dashboard (Fase 4) para alertar sobre productos por debajo de su stock mínimo. */
@Injectable()
export class StockBajoUseCase implements UseCase<void, StockBajoResponseDto[]> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<StockBajoResponseDto[]> {
    const items = await this.prisma.inventarioItem.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        stockMinimo: true,
        lotes: { select: { cantidadDisponible: true } },
      },
    });

    return items
      .map((item) => {
        const stockActual = item.lotes.reduce(
          (total, lote) => total + Number(lote.cantidadDisponible),
          0,
        );
        return {
          itemId: item.id,
          nombre: item.nombre,
          stockActual,
          stockMinimo: Number(item.stockMinimo),
        };
      })
      .filter((item) => item.stockActual < item.stockMinimo);
  }
}
