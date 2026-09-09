/** Presets del color picker de eventos. El usuario también puede elegir cualquier otro hex. */
export const COLORES_EVENTO_PRESET = [
  { hex: '#22C55E', nombre: 'Verde' },
  { hex: '#EAB308', nombre: 'Amarillo' },
  { hex: '#EF4444', nombre: 'Rojo' },
  { hex: '#8B5CF6', nombre: 'Morado' },
  { hex: '#0EA5E9', nombre: 'Azul' },
  { hex: '#F97316', nombre: 'Naranja' },
] as const;

export const COLOR_EVENTO_DEFAULT = COLORES_EVENTO_PRESET[0].hex;

/** Valida el color en el borde de confianza (API) y en el formulario (web). */
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
