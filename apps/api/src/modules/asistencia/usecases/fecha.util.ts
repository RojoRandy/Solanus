import { now } from '@/common/utils/date';

/**
 * Normaliza una fecha (o "hoy" en America/Mexico_City) al inicio del día en
 * UTC, para que coincida exactamente con lo que ya guardó una llamada
 * anterior en la misma fecha (la columna `fecha` de TurnoComida es
 * @db.Date — sin componente de hora).
 */
export function parseFechaSoloDia(fecha?: string): Date {
  const isoDia = fecha ?? now().format('YYYY-MM-DD');
  return new Date(`${isoDia}T00:00:00.000Z`);
}
