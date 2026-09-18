import { now, parseFechaSoloDia, TZ } from './date';

describe('now()', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('usa America/Mexico_City sin importar la zona del servidor', () => {
    expect(TZ).toBe('America/Mexico_City');
  });

  // `now()` debe leer siempre el reloj de México, sin importar en qué zona
  // corra el proceso (contenedor en UTC, laptop del dev, etc.) — la prueba
  // fija el instante real y verifica el día/hora que resulta en México.
  it('startOf("day") cae en la medianoche de México, no en la de otra zona', () => {
    // 05:00 UTC = 23:00 del día anterior en México (UTC-6): si `now()` no
    // fijara la zona, "hoy" leería un día adelantado.
    jest.useFakeTimers().setSystemTime(new Date('2026-03-10T05:00:00.000Z'));
    expect(now().format('YYYY-MM-DD')).toBe('2026-03-09');
    expect(now().startOf('day').format()).toBe('2026-03-09T00:00:00-06:00');
  });
});

describe('parseFechaSoloDia()', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('devuelve medianoche UTC del mismo día de México a las 19:00', () => {
    // 01:00 UTC del 10 de marzo = 19:00 del 9 de marzo en México (UTC-6).
    jest.useFakeTimers().setSystemTime(new Date('2026-03-10T01:00:00.000Z'));
    expect(parseFechaSoloDia().toISOString()).toBe('2026-03-09T00:00:00.000Z');
  });
});
