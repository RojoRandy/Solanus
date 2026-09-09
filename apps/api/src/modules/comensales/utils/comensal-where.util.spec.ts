import { construirWhereComensales } from './comensal-where.util';

describe('construirWhereComensales', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-08T12:00:00'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('sin grupoEdad no agrega fechaNacimiento al where', () => {
    const where = construirWhereComensales({});
    expect(where).toEqual({ activo: true });
    expect(where.fechaNacimiento).toBeUndefined();
  });

  it('ninos = nacidos después del corte de hace 18 años (quien cumple 18 hoy queda fuera)', () => {
    const where = construirWhereComensales({ grupoEdad: 'ninos' });
    expect(where.fechaNacimiento).toEqual({ gt: new Date('2008-09-08T00:00:00') });
  });

  it('adultos_mayores = nacidos en o antes del corte de hace 60 años (quien cumple 60 hoy queda dentro)', () => {
    const where = construirWhereComensales({ grupoEdad: 'adultos_mayores' });
    expect(where.fechaNacimiento).toEqual({ lte: new Date('1966-09-08T00:00:00') });
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
