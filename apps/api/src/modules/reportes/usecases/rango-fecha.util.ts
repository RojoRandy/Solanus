import { now } from '@/common/utils/date';

export interface RangoFecha {
  desde: Date;
  hasta: Date;
}

/** Normaliza el rango de un reporte: por defecto, del 1° del mes actual a hoy. */
export function resolverRangoFecha(desde?: string, hasta?: string): RangoFecha {
  return {
    desde: desde
      ? new Date(`${desde}T00:00:00.000Z`)
      : now().startOf('month').toDate(),
    hasta: hasta
      ? new Date(`${hasta}T23:59:59.999Z`)
      : now().endOf('day').toDate(),
  };
}
