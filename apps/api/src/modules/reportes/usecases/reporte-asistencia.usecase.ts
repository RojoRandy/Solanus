import { Injectable } from '@nestjs/common';
import { HorarioComida } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { resolverPeriodoMensual } from '@/common/utils/periodo.util';
import { ReporteAsistenciaResponseDto } from '../dto/reportes.dto';

export interface ReporteAsistenciaArgs {
  anio?: number;
  mes?: number;
}

interface FilaAcumulada {
  folio: number;
  nombre: string;
  dias: number[];
}

@Injectable()
export class ReporteAsistenciaUseCase implements UseCase<
  ReporteAsistenciaArgs,
  ReporteAsistenciaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ anio, mes }: ReporteAsistenciaArgs): Promise<ReporteAsistenciaResponseDto> {
    const periodo = resolverPeriodoMensual(anio, mes);

    const asistencias = await this.prisma.asistencia.findMany({
      where: { turno: { fecha: { gte: periodo.desde, lt: periodo.hasta } } },
      orderBy: [
        { comensal: { apellidos: 'asc' } },
        { comensal: { nombres: 'asc' } },
        { comensalId: 'asc' },
      ],
      select: {
        comensalId: true,
        comensal: { select: { folio: true, nombres: true, apellidos: true } },
        turno: { select: { fecha: true, horario: true } },
      },
    });

    const filasPorComensal = new Map<number, FilaAcumulada>();
    const totalesPorDia = new Array<number>(periodo.diasDelMes).fill(0);
    let desayuno = 0;
    let comida = 0;
    let cena = 0;

    for (const asistencia of asistencias) {
      // `turno.fecha` es `@db.Date` → vuelve como medianoche UTC exacta. Usar getUTCDate(),
      // nunca getDate(): en huso negativo (México) devolvería el día anterior y correría
      // toda la matriz un día.
      const dia = asistencia.turno.fecha.getUTCDate();
      const indice = dia - 1;

      let fila = filasPorComensal.get(asistencia.comensalId);
      if (!fila) {
        fila = {
          folio: asistencia.comensal.folio,
          nombre: `${asistencia.comensal.apellidos} ${asistencia.comensal.nombres}`,
          dias: new Array<number>(periodo.diasDelMes).fill(0),
        };
        filasPorComensal.set(asistencia.comensalId, fila);
      }

      fila.dias[indice] += 1;
      totalesPorDia[indice] += 1;

      if (asistencia.turno.horario === HorarioComida.DESAYUNO) desayuno += 1;
      else if (asistencia.turno.horario === HorarioComida.COMIDA) comida += 1;
      else cena += 1;
    }

    // El `orderBy` por relación ya dejó el Map ordenado por inserción — sin sort adicional.
    const comensales = Array.from(filasPorComensal.values()).map((fila) => ({
      folio: fila.folio,
      nombre: fila.nombre,
      dias: fila.dias,
      total: fila.dias.reduce((suma, valor) => suma + valor, 0),
    }));

    return {
      anio: periodo.anio,
      mes: periodo.mes,
      diasDelMes: periodo.diasDelMes,
      comensales,
      totalesPorDia,
      totalAsistencias: desayuno + comida + cena,
      desayuno,
      comida,
      cena,
    };
  }
}
