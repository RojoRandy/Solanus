import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';
import { VoluntarioErrors } from '@/common/errors/voluntario.errors';
import { TurnoVoluntarioResponseDto } from '../dto/turno.dto';

export interface AsignarVoluntarioTurnoArgs {
  turnoId: number;
  voluntarioId: number;
}

@Injectable()
export class AsignarVoluntarioTurnoUseCase implements UseCase<
  AsignarVoluntarioTurnoArgs,
  TurnoVoluntarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    turnoId,
    voluntarioId,
  }: AsignarVoluntarioTurnoArgs): Promise<TurnoVoluntarioResponseDto> {
    const turno = await this.prisma.turnoComida.findUnique({
      where: { id: turnoId },
    });
    if (!turno) throw AsistenciaErrors.Exceptions.TURNO_NOT_FOUND({ turnoId });

    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id: voluntarioId },
    });
    if (!voluntario)
      throw VoluntarioErrors.Exceptions.VOLUNTARIO_NOT_FOUND({ voluntarioId });
    if (!voluntario.activo)
      throw AsistenciaErrors.Exceptions.VOLUNTARIO_INACTIVO({ voluntarioId });

    try {
      const turnoVoluntario = await this.prisma.turnoVoluntario.create({
        data: { turnoId, voluntarioId },
        select: {
          id: true,
          voluntario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              fotoPath: true,
            },
          },
        },
      });
      return turnoVoluntario;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw AsistenciaErrors.Exceptions.VOLUNTARIO_YA_ASIGNADO({
          turnoId,
          voluntarioId,
        });
      }
      throw error;
    }
  }
}
