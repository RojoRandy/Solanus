import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { LoteVivoResponseDto } from '../dto/lote.dto';

/** Lotes con existencia disponible de una variante, ordenados FEFO — para el detalle de existencias. */
@Injectable()
export class ListarLotesVarianteUseCase implements UseCase<number, LoteVivoResponseDto[]> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(varianteId: number): Promise<LoteVivoResponseDto[]> {
    const variante = await this.prisma.varianteInventario.findUnique({ where: { id: varianteId } });
    if (!variante) throw InventarioErrors.Exceptions.VARIANTE_NOT_FOUND({ id: varianteId });

    const lotes = await this.prisma.loteInventario.findMany({
      where: { varianteId, cantidadDisponible: { gt: 0 } },
      orderBy: [{ fechaCaducidad: { sort: 'asc', nulls: 'last' } }],
      select: {
        id: true,
        marca: true,
        cantidadDisponible: true,
        fechaCaducidad: true,
        fechaIngreso: true,
        costoUnitario: true,
        origen: true,
        bienhechor: { select: { id: true, nombre: true } },
      },
    });

    return lotes.map((lote) => ({
      id: lote.id,
      marca: lote.marca,
      cantidadDisponible: Number(lote.cantidadDisponible),
      fechaCaducidad: lote.fechaCaducidad,
      fechaIngreso: lote.fechaIngreso,
      costoUnitario: lote.costoUnitario === null ? null : Number(lote.costoUnitario),
      origen: lote.origen,
      bienhechor: lote.bienhechor,
    }));
  }
}
