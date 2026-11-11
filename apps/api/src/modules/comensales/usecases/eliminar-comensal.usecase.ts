import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';

interface EliminarComensalArgs {
  id: number;
  /** Si es true, también da de baja a los menores activos a cargo del comensal. */
  incluirMenores?: boolean;
}

/** Baja lógica: un comensal nunca se borra de la base de datos (expediente/auditoría). */
@Injectable()
export class EliminarComensalUseCase implements UseCase<
  EliminarComensalArgs,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, incluirMenores }: EliminarComensalArgs): Promise<void> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    await this.prisma.$transaction([
      this.prisma.comensal.update({ where: { id }, data: { activo: false } }),
      ...(incluirMenores
        ? [
            this.prisma.comensal.updateMany({
              where: { tutorId: id, activo: true },
              data: { activo: false },
            }),
          ]
        : []),
    ]);
  }
}
