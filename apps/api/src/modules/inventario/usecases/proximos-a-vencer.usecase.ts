import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { now } from '@/common/utils/date';
import { ProximoAVencerResponseDto } from '../dto/reportes.dto';

const DIAS_POR_DEFECTO = 15;

/** Lo usa el Dashboard para alertar sobre lotes que están por caducar. */
@Injectable()
export class ProximosAVencerUseCase implements UseCase<
  number | undefined,
  ProximoAVencerResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dias: number = DIAS_POR_DEFECTO,
  ): Promise<ProximoAVencerResponseDto[]> {
    const hoy = now().startOf('day').toDate();
    const limite = now().startOf('day').add(dias, 'day').toDate();

    const lotes = await this.prisma.loteInventario.findMany({
      where: {
        cantidadDisponible: { gt: 0 },
        fechaCaducidad: { gte: hoy, lte: limite },
      },
      orderBy: { fechaCaducidad: 'asc' },
      select: {
        id: true,
        cantidadDisponible: true,
        fechaCaducidad: true,
        variante: {
          select: {
            id: true,
            estado: true,
            producto: { select: { nombre: true } },
            unidad: { select: { abrevia: true } },
          },
        },
      },
    });

    return lotes
      .filter((lote) => lote.fechaCaducidad !== null)
      .map((lote) => ({
        loteId: lote.id,
        varianteId: lote.variante.id,
        productoNombre: lote.variante.producto.nombre,
        unidad: lote.variante.unidad.abrevia,
        estado: lote.variante.estado,
        cantidadDisponible: Number(lote.cantidadDisponible),
        fechaCaducidad: lote.fechaCaducidad,
      }));
  }
}
