import { now } from '@/common/utils/date';

export interface RangoFecha {
  desde: Date;
  hasta: Date;
}

/**
 * Normaliza el rango de un reporte: por defecto, del 1° del mes actual a hoy.
 *
 * Los defaults se construyen con `Date.UTC` a partir de enteros (año/mes/día de `now()`),
 * igual que `resolverPeriodoMensual` — nunca a partir de un instante en hora local, que
 * mezclado con los límites explícitos (siempre UTC) hacía que el día 1 del mes se cayera
 * de los reportes cuando las columnas de fecha son `@db.Date`.
 */
export function resolverRangoFecha(desde?: string, hasta?: string): RangoFecha {
  const hoy = now();
  return {
    desde: desde
      ? new Date(`${desde}T00:00:00.000Z`)
      : new Date(Date.UTC(hoy.year(), hoy.month(), 1)),
    hasta: hasta
      ? new Date(`${hasta}T23:59:59.999Z`)
      : new Date(Date.UTC(hoy.year(), hoy.month(), hoy.date(), 23, 59, 59, 999)),
  };
}
