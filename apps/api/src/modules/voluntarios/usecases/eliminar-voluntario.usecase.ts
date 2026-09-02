import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { VoluntarioErrors } from '@/common/errors/voluntario.errors';

/** Baja lógica: eliminar un voluntario nunca borra el registro (auditoría / historial de turnos). */
@Injectable()
export class EliminarVoluntarioUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id },
    });
    if (!voluntario)
      throw VoluntarioErrors.Exceptions.VOLUNTARIO_NOT_FOUND({ id });

    await this.prisma.voluntario.update({
      where: { id },
      data: { activo: false },
    });
  }
}
