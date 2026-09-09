import { now } from '@/common/utils/date';

/** Edad exacta en años cumplidos a partir de la fecha de nacimiento. */
export function calcularEdad(fechaNacimiento: Date): number {
  return now().diff(fechaNacimiento, 'year');
}

export function esMayorDeEdad(fechaNacimiento: Date): boolean {
  return calcularEdad(fechaNacimiento) >= 18;
}

export type GrupoEdad = 'ninos' | 'adultos_mayores';

/**
 * Traduce un grupo etario a un rango de `fechaNacimiento`, porque la edad no se
 * persiste (se calcula con calcularEdad). Los cortes se toman al inicio del día
 * para que quien cumple años hoy caiga siempre del mismo lado:
 *  - ninos:           edad < 18  → nació DESPUÉS del corte (estricto), coherente con esMayorDeEdad.
 *  - adultos_mayores: edad >= 60 → nació EN el corte o antes (definición INAPAM: 60 años cumplidos).
 */
export function rangoFechaNacimiento(grupo: GrupoEdad): { gt?: Date; lte?: Date } {
  const hoy = now().startOf('day');
  return grupo === 'ninos'
    ? { gt: hoy.subtract(18, 'year').toDate() }
    : { lte: hoy.subtract(60, 'year').toDate() };
}
