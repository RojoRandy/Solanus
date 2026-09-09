import { now } from './date';

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export interface PeriodoMensual {
  anio: number;
  mes: number; // 1-12
  diasDelMes: number; // 28-31
  /** 1° del mes, medianoche UTC exacta — usar con `gte`. */
  desde: Date;
  /** 1° del mes SIGUIENTE, medianoche UTC exacta — EXCLUSIVO, usar con `lt`, nunca `lte`. */
  hasta: Date;
  etiqueta: string; // "Septiembre 2026"
}

/**
 * Resuelve un periodo mensual a partir de año/mes, con default al mes en curso.
 *
 * Todo se construye con `Date.UTC` a partir de enteros — nunca a partir de un
 * instante en hora local — para no repetir el bug que tenía
 * `rango-fecha.util.ts`: mezclar un default en hora local con límites
 * explícitos en UTC hacía que el día 1 del mes desapareciera de los reportes
 * cuando las columnas de fecha son `@db.Date` (medianoche UTC exacta).
 *
 * ponytail: los límites son UTC puro, así que un movimiento capturado el
 * último día del mes después de las ~18:00 hora de México cae en el mes
 * siguiente. Se acepta — el comedor cierra antes de esa hora en la práctica.
 * Vía de escape si alguien lo reporta: desplazar los límites de las columnas
 * *timestamp* (no las `@db.Date`) por el offset del comedor.
 */
export function resolverPeriodoMensual(anio?: number, mes?: number): PeriodoMensual {
  const hoy = now();
  const anioResuelto = anio ?? hoy.year();
  const mesResuelto = mes ?? hoy.month() + 1; // dayjs .month() es 0-indexado

  const desde = new Date(Date.UTC(anioResuelto, mesResuelto - 1, 1));
  const hasta = new Date(Date.UTC(anioResuelto, mesResuelto, 1));
  const diasDelMes = new Date(Date.UTC(anioResuelto, mesResuelto, 0)).getUTCDate();

  return {
    anio: anioResuelto,
    mes: mesResuelto,
    diasDelMes,
    desde,
    hasta,
    etiqueta: `${NOMBRES_MES[mesResuelto - 1]} ${anioResuelto}`,
  };
}
