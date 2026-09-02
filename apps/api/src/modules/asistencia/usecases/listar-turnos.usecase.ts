import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { TurnoResumenResponseDto } from '../dto/turno.dto';
import { parseFechaSoloDia } from './fecha.util';
import { turnoResumenSelect, mapTurnoResumen } from './turno-select.util';

@Injectable()
export class ListarTurnosUseCase implements UseCase<
  string | undefined,
  TurnoResumenResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(fecha?: string): Promise<TurnoResumenResponseDto[]> {
    const fechaDia = parseFechaSoloDia(fecha);

    const turnos = await this.prisma.turnoComida.findMany({
      where: { fecha: fechaDia },
      orderBy: { horario: 'asc' },
      select: turnoResumenSelect,
    });

    return turnos.map(mapTurnoResumen);
  }
}
