/**
 * El comedor opera en una sola zona horaria — America/Mexico_City — sin
 * importar dónde esté el navegador o el servidor. Centraliza aquí cualquier
 * "hoy"/hora mostrada para no repetir `timeZone` por todos lados.
 */
export const TZ = 'America/Mexico_City';

/** Fecha de hoy en México, como `yyyy-MM-dd`. */
export function hoyISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

/** Hora actual en México, 0-23 (para sugerir desayuno/comida/cena). */
export function horaEnMexico(): number {
  // hourCycle: 'h23' evita que medianoche salga como "24" (quirk de hour12: false).
  return Number(
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(new Date()),
  );
}

/** Hora corta (`HH:mm`) de un ISO, en horario de México. */
export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
}

/** Hora corta 12h (`8:30 a.m.`) de un ISO, en horario de México — para eventos de agenda. */
export function formatHoraEvento(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Fecha corta (`dd MMM`) de un ISO, en horario de México. */
export function formatFechaCortaTz(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { timeZone: TZ, day: '2-digit', month: 'short' });
}

/** Fecha larga en español (`d de mes de yyyy`), en horario de México. */
export function formatFechaLargaTz(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString('es-MX', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
}

/** Fecha larga con guiones (`d - mes - yyyy`), en horario de México. */
export function formatFechaGuionesTz(fecha: string | Date): string {
  return new Date(fecha)
    .toLocaleDateString('es-MX', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/ de /g, ' - ');
}

/** Clave `yyyy-MM-dd` del día calendario (en México) al que pertenece un instante. */
export function claveDiaMexico(fecha: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(fecha);
}

// México dejó el horario de verano en 2022 — offset fijo, sin DST que rastrear.
const OFFSET_MEXICO = '-06:00';

/** Fecha (`yyyy-MM-dd`) y hora (`HH:mm`) en México de un instante — para prellenar formularios de edición. */
export function fechaYHoraMexico(fecha: Date): { fecha: string; hora: string } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    hora: `${valor('hour')}:${valor('minute')}`,
  };
}

/** Instante ISO para una fecha (`yyyy-MM-dd`) y hora (`HH:mm`) dadas, interpretadas en horario de México. */
export function combinarFechaHoraMexico(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00${OFFSET_MEXICO}`).toISOString();
}

/**
 * Fecha corta (`dd MMM`) para valores *solo-fecha* del API (`@db.Date`:
 * caducidades, fecha de nacimiento, fecha de turno), que llegan serializados
 * como medianoche UTC. A esos NO se les aplica `TZ` de México — eso los
 * correría un día atrás (medianoche UTC = 18:00 del día anterior en México).
 * Se leen tal cual en UTC para obtener el día calendario real.
 */
export function formatFechaCortaSoloDia(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: 'short' });
}

/** Días entre hoy (México) y una fecha *solo-fecha* del API (ver arriba). */
export function diasHastaSoloDia(iso: string): number {
  const msPorDia = 1000 * 60 * 60 * 24;
  const [ah, mh, dh] = hoyISO().split('-').map(Number);
  const [af, mf, df] = iso.slice(0, 10).split('-').map(Number);
  return Math.round((Date.UTC(af, mf - 1, df) - Date.UTC(ah, mh - 1, dh)) / msPorDia);
}
