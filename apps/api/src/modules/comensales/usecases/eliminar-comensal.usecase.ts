import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';

/** Baja lógica: un comensal nunca se borra de la base de datos (expediente/auditoría). */
@Injectable()
export class EliminarComensalUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    await this.prisma.comensal.update({
      where: { id },
      data: { activo: false },
    });
  }
}
