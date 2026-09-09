import { resolverPeriodoMensual } from './periodo.util';

describe('resolverPeriodoMensual', () => {
  it('febrero bisiesto (2028) tiene 29 días', () => {
    const periodo = resolverPeriodoMensual(2028, 2);
    expect(periodo.diasDelMes).toBe(29);
  });

  it('febrero no bisiesto (2026) tiene 28 días', () => {
    const periodo = resolverPeriodoMensual(2026, 2);
    expect(periodo.diasDelMes).toBe(28);
  });

  it('diciembre: `hasta` es el 1° de enero del año siguiente (rollover de año)', () => {
    const periodo = resolverPeriodoMensual(2026, 12);
    expect(periodo.hasta).toEqual(new Date(Date.UTC(2027, 0, 1)));
  });

  it('`desde` cae exactamente a medianoche UTC del día 1, con anio/mes explícitos', () => {
    const periodo = resolverPeriodoMensual(2026, 9);
    expect(periodo.desde).toEqual(new Date(Date.UTC(2026, 8, 1)));
    expect(periodo.hasta).toEqual(new Date(Date.UTC(2026, 9, 1)));
    expect(periodo.anio).toBe(2026);
    expect(periodo.mes).toBe(9);
    expect(periodo.etiqueta).toBe('Septiembre 2026');
  });

  it('sin argumentos, usa el mes en curso construido con Date.UTC (no un instante local)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-15T12:00:00'));
    try {
      const periodo = resolverPeriodoMensual();
      expect(periodo.anio).toBe(2026);
      expect(periodo.mes).toBe(9);
      expect(periodo.desde).toEqual(new Date(Date.UTC(2026, 8, 1)));
    } finally {
      jest.useRealTimers();
    }
  });
});
