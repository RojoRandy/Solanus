import { Injectable } from '@nestjs/common';
import { HorarioComida, OrigenLote } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { now } from '@/common/utils/date';
import { ProximosAVencerUseCase } from '../../inventario/usecases/proximos-a-vencer.usecase';
import { StockBajoUseCase } from '../../inventario/usecases/stock-bajo.usecase';
import { ResumenDashboardResponseDto } from '../dto/dashboard.dto';

const DIAS_VENCIMIENTO_DEFECTO = 15;
const DIAS_PROMEDIO = 7;

/**
 * Agrega indicadores de varios módulos para el panel general. Reutiliza los
 * casos de uso de Inventario tal cual (no duplica sus consultas) e inyecta
 * directamente el resto vía Prisma, ya que son conteos simples de un solo uso.
 */
@Injectable()
export class ObtenerResumenDashboardUseCase implements UseCase<
  number | undefined,
  ResumenDashboardResponseDto
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly proximosAVencer: ProximosAVencerUseCase,
    private readonly stockBajo: StockBajoUseCase,
  ) {}

  async execute(
    diasVencimiento: number = DIAS_VENCIMIENTO_DEFECTO,
  ): Promise<ResumenDashboardResponseDto> {
    const hoy = now().startOf('day').toDate();
    const hace7Dias = now()
      .startOf('day')
      .subtract(DIAS_PROMEDIO, 'day')
      .toDate();
    const inicioMes = now().startOf('month').toDate();

    const [
      totalComensales,
      proximosAVencer,
      stockBajo,
      turnosHoy,
      turnosUltimos7Dias,
      lotesDonadosDelMes,
    ] = await Promise.all([
      this.prisma.comensal.count({ where: { activo: true } }),
      this.proximosAVencer.execute(diasVencimiento),
      this.stockBajo.execute(),
      this.prisma.turnoComida.findMany({
        where: { fecha: hoy },
        select: { horario: true, _count: { select: { asistencias: true } } },
      }),
      this.prisma.turnoComida.findMany({
        where: { fecha: { gte: hace7Dias, lt: hoy } },
        select: { _count: { select: { asistencias: true } } },
      }),
      this.prisma.loteInventario.findMany({
        where: { origen: OrigenLote.DONADO, fechaIngreso: { gte: inicioMes } },
        select: { costoTotal: true },
      }),
    ]);

    const porHorarioHoy = (horario: HorarioComida) =>
      turnosHoy.find((t) => t.horario === horario)?._count.asistencias ?? 0;

    const totalAsistenciasHoy = turnosHoy.reduce(
      (total, t) => total + t._count.asistencias,
      0,
    );
    const totalAsistenciasUltimos7Dias = turnosUltimos7Dias.reduce(
      (total, t) => total + t._count.asistencias,
      0,
    );

    const valorEstimadoDonativos = lotesDonadosDelMes.reduce(
      (total, lote) => total + (lote.costoTotal ? Number(lote.costoTotal) : 0),
      0,
    );

    return {
      totalComensales,
      proximosAVencer,
      stockBajo,
      asistencia: {
        hoy: totalAsistenciasHoy,
        promedioUltimos7Dias:
          Math.round((totalAsistenciasUltimos7Dias / DIAS_PROMEDIO) * 10) / 10,
        desayunoHoy: porHorarioHoy(HorarioComida.DESAYUNO),
        comidaHoy: porHorarioHoy(HorarioComida.COMIDA),
        cenaHoy: porHorarioHoy(HorarioComida.CENA),
      },
      donativosDelMes: {
        totalLotes: lotesDonadosDelMes.length,
        valorEstimado: valorEstimadoDonativos,
      },
    };
  }
}
