import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

/** El comedor opera en una sola zona horaria — no la del servidor. */
export const TZ = 'America/Mexico_City';

export const now = (): Dayjs => {
  return dayjs().tz(TZ);
};

/** Normaliza una fecha (o hoy en México) a medianoche UTC para columnas @db.Date. */
export function parseFechaSoloDia(fecha?: string): Date {
  const isoDia = fecha ?? now().format('YYYY-MM-DD');
  return new Date(`${isoDia}T00:00:00.000Z`);
}
