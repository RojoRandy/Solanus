import { PrismaService } from '@/prisma/prisma.service';
import { EliminarComensalUseCase } from './eliminar-comensal.usecase';

function crear(existe = true) {
  const update = jest.fn();
  const updateMany = jest.fn();
  const prisma = {
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    comensal: {
      findUnique: jest.fn().mockResolvedValue(existe ? { id: 1 } : null),
      update,
      updateMany,
    },
  } as unknown as PrismaService;
  return { useCase: new EliminarComensalUseCase(prisma), update, updateMany };
}

describe('EliminarComensalUseCase', () => {
  it('lanza si el comensal no existe', async () => {
    const { useCase, update } = crear(false);
    await expect(useCase.execute({ id: 1 })).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  it('da de baja solo al tutor por defecto', async () => {
    const { useCase, update, updateMany } = crear();
    await useCase.execute({ id: 1 });
    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { activo: false } });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('da de baja también a los menores activos si se pide', async () => {
    const { useCase, updateMany } = crear();
    await useCase.execute({ id: 1, incluirMenores: true });
    expect(updateMany).toHaveBeenCalledWith({
      where: { tutorId: 1, activo: true },
      data: { activo: false },
    });
  });
});
