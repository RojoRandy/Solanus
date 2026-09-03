import { Injectable } from '@nestjs/common';
import { HorarioComida } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ReporteAsistenciaResponseDto } from '../dto/reportes.dto';
import { resolverRangoFecha } from './rango-fecha.util';

export interface ReporteAsistenciaArgs {
  desde?: string;
  hasta?: string;
}

@Injectable()
export class ReporteAsistenciaUseCase implements UseCase<
  ReporteAsistenciaArgs,
  ReporteAsistenciaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    desde,
    hasta,
  }: ReporteAsistenciaArgs): Promise<ReporteAsistenciaResponseDto> {
    const rango = resolverRangoFecha(desde, hasta);

    const turnos = await this.prisma.turnoComida.findMany({
      where: { fecha: { gte: rango.desde, lte: rango.hasta } },
      orderBy: { fecha: 'asc' },
      select: {
        fecha: true,
        horario: true,
        _count: { select: { asistencias: true } },
      },
    });

    const porDiaMap = new Map<
      string,
      { desayuno: number; comida: number; cena: number }
    >();
    let desayuno = 0;
    let comida = 0;
    let cena = 0;

    for (const turno of turnos) {
      const clave = turno.fecha.toISOString().slice(0, 10);
      const entrada = porDiaMap.get(clave) ?? {
        desayuno: 0,
        comida: 0,
        cena: 0,
      };
      const cantidad = turno._count.asistencias;

      if (turno.horario === HorarioComida.DESAYUNO) {
        entrada.desayuno += cantidad;
        desayuno += cantidad;
      } else if (turno.horario === HorarioComida.COMIDA) {
        entrada.comida += cantidad;
        comida += cantidad;
      } else {
        entrada.cena += cantidad;
        cena += cantidad;
      }

      porDiaMap.set(clave, entrada);
    }

    const porDia = Array.from(porDiaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, valores]) => ({
        fecha,
        ...valores,
        total: valores.desayuno + valores.comida + valores.cena,
      }));

    return {
      totalAsistencias: desayuno + comida + cena,
      desayuno,
      comida,
      cena,
      porDia,
    };
  }
}
