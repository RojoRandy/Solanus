/**
 * Normaliza una fecha (o "hoy") al inicio del día en UTC, para que coincida
 * exactamente con lo que ya guardó una llamada anterior en la misma fecha
 * (la columna `fecha` de TurnoComida es @db.Date — sin componente de hora).
 */
export function parseFechaSoloDia(fecha?: string): Date {
  const isoDia = fecha ?? new Date().toISOString().slice(0, 10);
  return new Date(`${isoDia}T00:00:00.000Z`);
}
