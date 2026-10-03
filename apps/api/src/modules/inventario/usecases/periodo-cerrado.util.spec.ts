import { Prisma } from '@prisma/client';
import { validarPeriodoAbierto } from './periodo-cerrado.util';

const cierre = {
  desde: new Date('2026-10-01T00:00:00.000Z'),
  hasta: new Date('2026-10-31T00:00:00.000Z'),
};

function crearTransaccionMock() {
  const findFirst = jest.fn(async ({ where }: {
    where: { desde: { lte: Date }; hasta: { gte: Date } };
  }) => cierre.desde <= where.desde.lte && cierre.hasta >= where.hasta.gte
    ? cierre : null);
  const tx = { cierreInventario: { findFirst } } as unknown as Prisma.TransactionClient;
  return { tx, findFirst };
}

describe('validarPeriodoAbierto', () => {
  it.each([
    '2026-10-01',
    '2026-10-31',
    '2026-10-15T22:30:00.000Z',
  ])('bloquea %s con PERIODO_CERRADO, incluidos los bordes', async (fecha) => {
    const { tx, findFirst } = crearTransaccionMock();
    await expect(validarPeriodoAbierto(tx, new Date(fecha))).rejects.toMatchObject({
      status: 409,
      response: { code: 'PERIODO_CERRADO', data: cierre },
    });
    const dia = new Date(`${fecha.slice(0, 10)}T00:00:00.000Z`);
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findFirst).toHaveBeenCalledWith({
      where: { desde: { lte: dia }, hasta: { gte: dia } },
    });
  });

  it.each(['2026-09-30', '2026-11-01'])(
    'permite %s fuera del cierre',
    async (fecha) => {
      const { tx } = crearTransaccionMock();
      await expect(validarPeriodoAbierto(tx, new Date(fecha))).resolves.toBeUndefined();
    },
  );
});
