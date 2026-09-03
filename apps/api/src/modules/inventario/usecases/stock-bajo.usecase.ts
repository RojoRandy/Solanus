import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { StockBajoResponseDto } from '../dto/reportes.dto';

/** Lo usa el Dashboard para alertar sobre variantes por debajo de su stock mínimo. */
@Injectable()
export class StockBajoUseCase implements UseCase<void, StockBajoResponseDto[]> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<StockBajoResponseDto[]> {
    const variantes = await this.prisma.varianteInventario.findMany({
      where: { activo: true },
      select: {
        id: true,
        estado: true,
        stockMinimo: true,
        producto: { select: { nombre: true } },
        unidad: { select: { abrevia: true } },
        lotes: { select: { cantidadDisponible: true } },
      },
    });

    return variantes
      .map((variante) => {
        const stockActual = variante.lotes.reduce(
          (total, lote) => total + Number(lote.cantidadDisponible),
          0,
        );
        return {
          varianteId: variante.id,
          productoNombre: variante.producto.nombre,
          unidad: variante.unidad.abrevia,
          estado: variante.estado,
          stockActual,
          stockMinimo: Number(variante.stockMinimo),
        };
      })
      .filter((variante) => variante.stockActual < variante.stockMinimo);
  }
}
