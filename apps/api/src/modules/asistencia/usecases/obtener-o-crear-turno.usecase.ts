import { Injectable } from '@nestjs/common';
import { HorarioComida } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { TurnoResponseDto } from '../dto/turno.dto';
import { parseFechaSoloDia } from './fecha.util';
import { turnoDetalleSelect, mapTurnoDetalle } from './turno-select.util';

export interface ObtenerOCrearTurnoArgs {
  fecha?: string;
  horario: HorarioComida;
  registradoPorId: number;
}

/**
 * La pantalla de Turno de comida siempre necesita "el turno de hoy" (o el de la
 * fecha elegida) listo para capturar sobre él. Si no existe todavía, se crea aquí
 * mismo (upsert sobre el único índice [fecha, horario]) en vez de forzar un paso
 * de "crear turno" separado — así el primer folio del día simplemente funciona.
 */
@Injectable()
export class ObtenerOCrearTurnoUseCase implements UseCase<
  ObtenerOCrearTurnoArgs,
  TurnoResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    fecha,
    horario,
    registradoPorId,
  }: ObtenerOCrearTurnoArgs): Promise<TurnoResponseDto> {
    const fechaDia = parseFechaSoloDia(fecha);

    const turno = await this.prisma.turnoComida.upsert({
      where: { fecha_horario: { fecha: fechaDia, horario } },
      update: {},
      create: { fecha: fechaDia, horario, registradoPorId },
      select: turnoDetalleSelect,
    });

    return mapTurnoDetalle(turno);
  }
}
