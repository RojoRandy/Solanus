import { Injectable } from '@nestjs/common';
import { OrigenLote } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ReporteDonativosResponseDto } from '../dto/reportes.dto';
import { resolverRangoFecha } from './rango-fecha.util';

export interface ReporteDonativosArgs {
  desde?: string;
  hasta?: string;
}

const SIN_BIENHECHOR = 'Sin especificar';

@Injectable()
export class ReporteDonativosUseCase implements UseCase<
  ReporteDonativosArgs,
  ReporteDonativosResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    desde,
    hasta,
  }: ReporteDonativosArgs): Promise<ReporteDonativosResponseDto> {
    const rango = resolverRangoFecha(desde, hasta);

    const lotes = await this.prisma.loteInventario.findMany({
      where: {
        origen: OrigenLote.DONADO,
        fechaIngreso: { gte: rango.desde, lte: rango.hasta },
      },
      select: {
        entradaId: true,
        costoTotal: true,
        bienhechor: { select: { id: true, nombre: true } },
      },
    });

    const porBienhechorMap = new Map<
      string,
      {
        bienhechorId: number;
        bienhechor: string;
        cantidadLotes: number;
        valorEstimado: number;
      }
    >();
    // Un lote es una entrada, que puede tener varios productos.
    const entradasPorBienhechor = new Map<string, Set<number>>();
    const entradasGlobales = new Set<number>();

    for (const lote of lotes) {
      const clave = lote.bienhechor
        ? String(lote.bienhechor.id)
        : SIN_BIENHECHOR;
      const entrada = porBienhechorMap.get(clave) ?? {
        bienhechorId: lote.bienhechor?.id ?? 0,
        bienhechor: lote.bienhechor?.nombre ?? SIN_BIENHECHOR,
        cantidadLotes: 0,
        valorEstimado: 0,
      };
      const entradas = entradasPorBienhechor.get(clave) ?? new Set<number>();
      entradas.add(lote.entradaId);
      entradasPorBienhechor.set(clave, entradas);
      entradasGlobales.add(lote.entradaId);
      entrada.cantidadLotes = entradas.size;
      entrada.valorEstimado += lote.costoTotal ? Number(lote.costoTotal) : 0;
      porBienhechorMap.set(clave, entrada);
    }

    const porBienhechor = Array.from(porBienhechorMap.values()).sort(
      (a, b) => b.valorEstimado - a.valorEstimado,
    );

    return {
      totalLotes: entradasGlobales.size,
      valorEstimado: porBienhechor.reduce(
        (total, b) => total + b.valorEstimado,
        0,
      ),
      porBienhechor,
    };
  }
}
