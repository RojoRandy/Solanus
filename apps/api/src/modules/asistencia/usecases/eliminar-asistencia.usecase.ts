import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';

/** Deshace un registro de asistencia capturado por error. Reservado a admin/usuario. */
@Injectable()
export class EliminarAsistenciaUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
    });
    if (!asistencia)
      throw AsistenciaErrors.Exceptions.ASISTENCIA_NOT_FOUND({ id });

    await this.prisma.asistencia.delete({ where: { id } });
  }
}
