import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';

export interface QuitarVoluntarioTurnoArgs {
  turnoId: number;
  voluntarioId: number;
}

@Injectable()
export class QuitarVoluntarioTurnoUseCase implements UseCase<
  QuitarVoluntarioTurnoArgs,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    turnoId,
    voluntarioId,
  }: QuitarVoluntarioTurnoArgs): Promise<void> {
    const asignacion = await this.prisma.turnoVoluntario.findUnique({
      where: { turnoId_voluntarioId: { turnoId, voluntarioId } },
    });
    if (!asignacion)
      throw AsistenciaErrors.Exceptions.VOLUNTARIO_NO_ASIGNADO({
        turnoId,
        voluntarioId,
      });

    await this.prisma.turnoVoluntario.delete({ where: { id: asignacion.id } });
  }
}
