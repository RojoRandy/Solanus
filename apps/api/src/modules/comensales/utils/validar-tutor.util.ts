import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { esMayorDeEdad } from './edad.util';

export interface ValidarTutorArgs {
  /** id del comensal al que se le asigna el tutor (undefined en alta, aún no existe). */
  comensalId?: number;
  edadComensal: number;
  tutorId?: number | null;
}

/**
 * Aplica las reglas de negocio de tutor-menor (ver brief del módulo Comensales):
 * - Un menor de edad debe tener tutorId asignado a un mayor de edad activo, sin tutor propio.
 * - Un mayor de edad no debe tener tutorId.
 * Lanza el ComensalErrors correspondiente si alguna regla se incumple.
 */
export async function validarTutorAsignado(
  prisma: PrismaService,
  { comensalId, edadComensal, tutorId }: ValidarTutorArgs,
): Promise<void> {
  if (edadComensal >= 18) {
    if (tutorId) throw ComensalErrors.Exceptions.MAYOR_NO_DEBE_TENER_TUTOR();
    return;
  }

  if (!tutorId) throw ComensalErrors.Exceptions.TUTOR_REQUERIDO_PARA_MENOR();

  if (comensalId !== undefined && tutorId === comensalId) {
    throw ComensalErrors.Exceptions.TUTOR_NO_PUEDE_SER_EL_MISMO_COMENSAL();
  }

  const tutor = await prisma.comensal.findUnique({ where: { id: tutorId } });
  if (!tutor || !tutor.activo) {
    throw ComensalErrors.Exceptions.TUTOR_NOT_FOUND({ tutorId });
  }
  if (!esMayorDeEdad(tutor.fechaNacimiento)) {
    throw ComensalErrors.Exceptions.TUTOR_DEBE_SER_MAYOR_DE_EDAD({ tutorId });
  }
  if (tutor.tutorId !== null) {
    throw ComensalErrors.Exceptions.MENOR_NO_PUEDE_SER_TUTOR({ tutorId });
  }
}
