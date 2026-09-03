import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { StockVarianteResponseDto } from '../dto/reportes.dto';

@Injectable()
export class StockVarianteUseCase implements UseCase<number, StockVarianteResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(varianteId: number): Promise<StockVarianteResponseDto> {
    const variante = await this.prisma.varianteInventario.findUnique({
      where: { id: varianteId },
      select: {
        id: true,
        lotes: { select: { cantidadDisponible: true } },
      },
    });
    if (!variante) throw InventarioErrors.Exceptions.VARIANTE_NOT_FOUND({ id: varianteId });

    const stockActual = variante.lotes.reduce(
      (total, lote) => total + Number(lote.cantidadDisponible),
      0,
    );

    return { varianteId, stockActual };
  }
}
