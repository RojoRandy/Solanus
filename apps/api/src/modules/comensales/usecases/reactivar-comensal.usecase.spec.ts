import { PrismaService } from '@/prisma/prisma.service';
import { ReactivarComensalUseCase } from './reactivar-comensal.usecase';

const haceAnios = (n: number) => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - n - 1);
  return d;
};

function crear(comensales: Record<number, object | null>) {
  const update = jest.fn();
  const updateMany = jest.fn();
  const prisma = {
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    comensal: {
      updateMany,
      findUnique: jest.fn(({ where }) => Promise.resolve(comensales[where.id] ?? null)),
      update,
    },
  } as unknown as PrismaService;
  return { useCase: new ReactivarComensalUseCase(prisma), update, updateMany };
}

describe('ReactivarComensalUseCase', () => {
  it('lanza si el comensal no existe', async () => {
    const { useCase, update } = crear({});
    await expect(useCase.execute({ id: 1 })).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  it('reactiva a un adulto sin tutor', async () => {
    const { useCase, update } = crear({
      1: { id: 1, activo: false, fechaNacimiento: haceAnios(30), tutorId: null },
    });
    await useCase.execute({ id: 1 });
    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { activo: true } });
  });

  it('rechaza a un adulto que conserva tutorId', async () => {
    const { useCase, update } = crear({
      1: { id: 1, activo: false, fechaNacimiento: haceAnios(20), tutorId: 2 },
    });
    await expect(useCase.execute({ id: 1 })).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  it('rechaza a un menor con tutor inactivo', async () => {
    const { useCase, update } = crear({
      1: { id: 1, activo: false, fechaNacimiento: haceAnios(8), tutorId: 2 },
      2: { id: 2, activo: false, fechaNacimiento: haceAnios(35), tutorId: null },
    });
    await expect(useCase.execute({ id: 1 })).rejects.toMatchObject({
      response: { description: 'El tutor de este menor está inactivo' },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('reactiva solo al tutor si no se incluyen menores', async () => {
    const { useCase, update, updateMany } = crear({
      1: { id: 1, activo: false, fechaNacimiento: haceAnios(30), tutorId: null },
    });
    await useCase.execute({ id: 1 });
    expect(update).toHaveBeenCalledTimes(1);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('reactiva también a los menores inactivos si se pide', async () => {
    const { useCase, updateMany } = crear({
      1: { id: 1, activo: false, fechaNacimiento: haceAnios(30), tutorId: null },
    });
    await useCase.execute({ id: 1, incluirMenores: true });
    expect(updateMany).toHaveBeenCalledWith({
      where: { tutorId: 1, activo: false, fechaNacimiento: { gt: expect.any(Date) } },
      data: { activo: true },
    });
  });
});
