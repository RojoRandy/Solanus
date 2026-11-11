import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { calcularEdad, corteMayoriaEdad } from '../utils/edad.util';
import { validarTutorAsignado } from '../utils/validar-tutor.util';

interface ReactivarComensalArgs {
  id: number;
  /** Si es true, también reactiva a los menores inactivos a cargo del comensal. */
  incluirMenores?: boolean;
}

/** Revierte la baja lógica de `EliminarComensalUseCase`. */
@Injectable()
export class ReactivarComensalUseCase implements UseCase<
  ReactivarComensalArgs,
  void
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, incluirMenores }: ReactivarComensalArgs): Promise<void> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    if (comensal.tutorId) {
      const tutor = await this.prisma.comensal.findUnique({
        where: { id: comensal.tutorId },
      });
      if (tutor && !tutor.activo) {
        throw ComensalErrors.Exceptions.TUTOR_INACTIVO({ tutorId: tutor.id });
      }
    }

    // Mismas reglas de tutor que al crear/actualizar; nunca se modifica tutorId aquí.
    await validarTutorAsignado(this.prisma, {
      comensalId: id,
      edadComensal: calcularEdad(comensal.fechaNacimiento),
      tutorId: comensal.tutorId,
    });

    await this.prisma.$transaction([
      this.prisma.comensal.update({ where: { id }, data: { activo: true } }),
      ...(incluirMenores
        ? [
            // Solo menores de edad: un adulto con tutorId obsoleto se corrige a mano.
            this.prisma.comensal.updateMany({
              where: {
                tutorId: id,
                activo: false,
                fechaNacimiento: { gt: corteMayoriaEdad() },
              },
              data: { activo: true },
            }),
          ]
        : []),
    ]);
  }
}
