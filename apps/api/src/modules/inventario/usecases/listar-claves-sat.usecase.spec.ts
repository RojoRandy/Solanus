import { CLAVES_SAT } from '../claves-sat';
import { ListarClavesSatUseCase } from './listar-claves-sat.usecase';

describe('ListarClavesSatUseCase', () => {
  const useCase = new ListarClavesSatUseCase();

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
