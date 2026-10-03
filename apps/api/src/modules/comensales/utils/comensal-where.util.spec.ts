import { construirWhereComensales } from './comensal-where.util';

describe('construirWhereComensales', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-08T12:00:00'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('filtra por género cuando viene en la consulta', () => {
    const where = construirWhereComensales({ genero: 'MUJER' });
    expect(where.genero).toBe('MUJER');
  });

  it('sin género no agrega la clave genero al where', () => {
    const where = construirWhereComensales({});
    expect(where).not.toHaveProperty('genero');
  });

  it('sin grupoEdad no agrega fechaNacimiento al where', () => {
    const where = construirWhereComensales({});
    expect(where).toEqual({ activo: true });
    expect(where.fechaNacimiento).toBeUndefined();
  });

  it('ninos = nacidos después del corte de hace 18 años (quien cumple 18 hoy queda fuera)', () => {
    const where = construirWhereComensales({ grupoEdad: 'ninos' });
    // El corte se ancla al día calendario en América/Ciudad de México, no al de la
    // máquina que corre el test — por eso se compara contra medianoche UTC explícita.
    expect(where.fechaNacimiento).toEqual({ gt: new Date('2008-09-08T00:00:00.000Z') });
  });

  it('adultos = nacidos en o antes del corte de 18 y después del corte de 60', () => {
    const where = construirWhereComensales({ grupoEdad: 'adultos' });
    expect(where.fechaNacimiento).toEqual({
      lte: new Date('2008-09-08T00:00:00.000Z'),
      gt: new Date('1966-09-08T00:00:00.000Z'),
    });

    const { lte, gt } = where.fechaNacimiento as { lte: Date; gt: Date };
    const entraEnRango = (fecha: Date) => fecha <= lte && fecha > gt;
    expect(entraEnRango(new Date('2008-09-08T00:00:00.000Z'))).toBe(true); // cumple 18 hoy
    expect(entraEnRango(new Date('1966-09-08T00:00:00.000Z'))).toBe(false); // cumple 60 hoy
    expect(entraEnRango(new Date('1967-09-08T00:00:00.000Z'))).toBe(true); // 59 años
  });

  it('adultos_mayores = nacidos en o antes del corte de hace 60 años (quien cumple 60 hoy queda dentro)', () => {
    const where = construirWhereComensales({ grupoEdad: 'adultos_mayores' });
    expect(where.fechaNacimiento).toEqual({ lte: new Date('1966-09-08T00:00:00.000Z') });
  });

  it('la búsqueda numérica agrega { folio } al OR; la no numérica no', () => {
    const conFolio = construirWhereComensales({ busqueda: '42' });
    expect(conFolio.OR).toEqual(
      expect.arrayContaining([{ folio: 42 }]),
    );

    const soloTexto = construirWhereComensales({ busqueda: 'ana' });
    expect(soloTexto.OR).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ folio: expect.anything() })]),
    );
  });
});
