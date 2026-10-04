import { CLAVES_SAT } from '../claves-sat';
import { ListarClavesSatUseCase, normalizar } from './listar-claves-sat.usecase';

describe('normalizar', () => {
  it.each([
    ['  Fríjoles, SECOS!! ', 'frijoles secos'],
    ['Café/Té', 'cafe te'],
    ['Año', 'ano'],
    ['Pingüino', 'pinguino'],
    ['"A-B.C" ¿D?\t E\n123', 'a b c d e 123'],
  ])('normaliza %j como %j', (texto, esperado) => {
    expect(normalizar(texto)).toBe(esperado);
  });
});

describe('ListarClavesSatUseCase', () => {
  const useCase = new ListarClavesSatUseCase();

  it.each(['Fríjol', 'FRIJOL', 'frijol,', '  frijol  '])(
    'encuentra ambas claves de frijol con acentos, signos o espacios: %s',
    async (buscar) => {
      const resultados = await useCase.execute({ buscar });
      expect(resultados.map(({ clave }) => clave)).toEqual(
        expect.arrayContaining(['50421800', '50401800']),
      );
    },
  );

  it('encuentra café con acento', async () => {
    const resultados = await useCase.execute({ buscar: 'café' });
    expect(resultados.map(({ clave }) => clave)).toContain('50201706');
  });

  it.each(['aceite cocina', 'cocina aceite', '50151513 cocina comestibles'])(
    'encuentra todas las palabras sin exigir continuidad ni orden: %s',
    async (buscar) => {
      const resultados = await useCase.execute({ buscar });
      expect(resultados.map(({ clave }) => clave)).toContain('50151513');
    },
  );

  it('exige que todas las palabras estén presentes', async () => {
    expect(await useCase.execute({ buscar: 'aceite inexistente' })).toEqual([]);
  });

  it.each(['50-22-11', '5022 11'])(
    'encuentra prefijos numéricos con separadores: %s',
    async (buscar) => {
      const resultados = await useCase.execute({ buscar });
      expect(resultados.map(({ clave }) => clave)).toContain('50221101');
    },
  );

  it.each(['¿?', '  \t\n  '])(
    'devuelve las 77 claves cuando el término normalizado queda vacío: %j',
    async (buscar) => {
      const resultados = await useCase.execute({ buscar });
      expect(resultados).toHaveLength(77);
      expect(resultados).toEqual(
        CLAVES_SAT.map(({ clave, descripcion }) => ({ clave, descripcion })),
      );
    },
  );

  it.each(['frijol', 'FRÍJOL', 'frijoles'])('encuentra frijoles ignorando acentos y mayúsculas: %s', async (buscar) => {
    const resultados = await useCase.execute({ buscar });
    expect(resultados.map(({ clave }) => clave)).toEqual(
      expect.arrayContaining(['50421800', '50401800']),
    );
    expect(resultados).toContainEqual({ clave: '50401800', descripcion: 'Fríjoles' });
  });

  it('busca por prefijo numérico', async () => {
    const resultados = await useCase.execute({ buscar: '50221' });
    expect(resultados.map(({ clave }) => clave)).toContain('50221101');
    expect(resultados.every(({ clave }) => clave.startsWith('50221'))).toBe(true);
  });

  it.each(['fabuloso', 'FÁBULOSO'])('busca por palabras clave normalizadas: %s', async (buscar) => {
    const resultados = await useCase.execute({ buscar });
    expect(resultados.map(({ clave }) => clave)).toContain('47131805');
  });

  it.each([{}, { buscar: '' }])('devuelve los 77 registros en orden sin búsqueda: %j', async (query) => {
    const resultados = await useCase.execute(query);
    expect(resultados).toHaveLength(77);
    expect(resultados).toEqual(CLAVES_SAT.map(({ clave, descripcion }) => ({ clave, descripcion })));
    expect(resultados.every((resultado) => !('palabrasClave' in resultado))).toBe(true);
  });

  it('limita una búsqueda genérica a 20 resultados', async () => {
    const resultados = await useCase.execute({ buscar: 'a' });
    expect(resultados).toHaveLength(20);
  });

  it('devuelve una lista vacía si no hay coincidencias', async () => {
    expect(await useCase.execute({ buscar: 'sin-coincidencias' })).toEqual([]);
  });
});
