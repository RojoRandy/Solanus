// Copia de packages/shared/src/agenda.ts — apps/api no puede importar en tiempo
// de ejecución ese paquete (se exporta como TypeScript crudo sin build propio,
// y el runtime de Nest corre sobre JS ya compilado). Mismo patrón que
// common/interfaces/enums.ts para los roles: mantener en sync a mano.
export const colorEventoRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * Un evento es "pasado" cuando su día ya quedó atrás. Los eventos de hoy
 * siguen siendo próximos aunque su hora ya pasó: siguen apareciendo en la
 * columna de hoy y siguen siendo editables durante toda la jornada.
 */
export function esEventoPasado(fechaHora: Date | string, ahora: Date = new Date()): boolean {
  const inicioDeHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  return new Date(fechaHora) < inicioDeHoy;
}
