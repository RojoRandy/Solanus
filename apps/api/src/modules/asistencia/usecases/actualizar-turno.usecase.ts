import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';
import { ActualizarTurnoDto, TurnoResponseDto } from '../dto/turno.dto';
import { turnoDetalleSelect, mapTurnoDetalle } from './turno-select.util';

export interface ActualizarTurnoArgs {
  id: number;
  dto: ActualizarTurnoDto;
}

@Injectable()
export class ActualizarTurnoUseCase implements UseCase<
  ActualizarTurnoArgs,
  TurnoResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, dto }: ActualizarTurnoArgs): Promise<TurnoResponseDto> {
    const existente = await this.prisma.turnoComida.findUnique({
      where: { id },
    });
    if (!existente) throw AsistenciaErrors.Exceptions.TURNO_NOT_FOUND({ id });

    const turno = await this.prisma.turnoComida.update({
      where: { id },
      data: { menu: dto.menu, notas: dto.notas },
      select: turnoDetalleSelect,
    });

    return mapTurnoDetalle(turno);
  }
}
