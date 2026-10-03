import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';

/** Deshace un registro de primera vez capturado por error. Reservado a admin/usuario. */
@Injectable()
export class EliminarPrimeraVezUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const registro = await this.prisma.asistenciaPrimeraVez.findUnique({
      where: { id },
    });
    if (!registro)
      throw AsistenciaErrors.Exceptions.PRIMERA_VEZ_NOT_FOUND({ id });

    await this.prisma.asistenciaPrimeraVez.delete({ where: { id } });
  }
}
