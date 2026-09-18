import { now } from '@/common/utils/date';

/** Edad exacta en años cumplidos a partir de la fecha de nacimiento. */
export function calcularEdad(fechaNacimiento: Date): number {
  return now().diff(fechaNacimiento, 'year');
}

export function esMayorDeEdad(fechaNacimiento: Date): boolean {
  return calcularEdad(fechaNacimiento) >= 18;
}

export type GrupoEdad = 'ninos' | 'adultos_mayores';

/** Fecha de nacimiento límite para cumplir 18 años al día de hoy en México. */
export function corteMayoriaEdad(): Date {
  const hoy = now();
  return new Date(Date.UTC(hoy.year() - 18, hoy.month(), hoy.date()));
}

/**
 * Traduce un grupo etario a un rango de `fechaNacimiento`, porque la edad no se
 * persiste (se calcula con calcularEdad). Los cortes se toman al inicio del día
 * para que quien cumple años hoy caiga siempre del mismo lado:
 *  - ninos:           edad < 18  → nació DESPUÉS del corte (estricto), coherente con esMayorDeEdad.
 *  - adultos_mayores: edad >= 60 → nació EN el corte o antes (definición INAPAM: 60 años cumplidos).
 */
export function rangoFechaNacimiento(grupo: GrupoEdad): { gt?: Date; lte?: Date } {
  if (grupo === 'ninos') return { gt: corteMayoriaEdad() };

  const hoy = now();
  // No se usa `hoy.subtract(N, 'year')`: encadenado con `.tz()`, dayjs calcula mal
  // el offset histórico de America/Mexico_City para fechas antes de ~1970 (un
  // adulto mayor de 60+ cae ahí) y el corte termina 7 días antes de lo debido.
  // Se arma la fecha directo a partir de los componentes de calendario en México.
  return { lte: new Date(Date.UTC(hoy.year() - 60, hoy.month(), hoy.date())) };
}
