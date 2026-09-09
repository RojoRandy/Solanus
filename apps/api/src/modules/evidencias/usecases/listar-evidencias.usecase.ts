import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { resolverPeriodoMensual } from '@/common/utils/periodo.util';
import { EvidenciaResponseDto } from '../dto/evidencia.dto';
import { EVIDENCIA_SELECT, mapEvidencia } from './evidencia.mapper';

export interface ListarEvidenciasArgs {
  anio?: number;
  mes?: number;
}

@Injectable()
export class ListarEvidenciasUseCase implements UseCase<
  ListarEvidenciasArgs,
  EvidenciaResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ anio, mes }: ListarEvidenciasArgs): Promise<EvidenciaResponseDto[]> {
    const periodo = resolverPeriodoMensual(anio, mes);

    const evidencias = await this.prisma.evidenciaMensual.findMany({
      where: { anio: periodo.anio, mes: periodo.mes },
      orderBy: { createdAt: 'asc' },
      select: EVIDENCIA_SELECT,
    });

    return evidencias.map(mapEvidencia);
  }
}
