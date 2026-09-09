import { ListarDonativosDineroUseCase } from './listar-donativos-dinero.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildPrisma(sumMonto: unknown) {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const aggregate = jest.fn().mockResolvedValue({ _sum: { monto: sumMonto } });

  const prisma = {
    donativoDinero: { findMany, count, aggregate },
  } as unknown as PrismaService;

  return { prisma, findMany, count, aggregate };
}

describe('ListarDonativosDineroUseCase', () => {
  it('aplica el mismo where a findMany, count y aggregate, con rango de fecha', async () => {
    const { prisma, findMany, count, aggregate } = buildPrisma(0);
    const useCase = new ListarDonativosDineroUseCase(prisma);

    await useCase.execute({ bienhechorId: 3, desde: '2026-01-01', hasta: '2026-02-01' });

    const whereEsperado = {
      bienhechorId: 3,
      fecha: { gte: new Date('2026-01-01'), lte: new Date('2026-02-01') },
    };
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: whereEsperado }));
    expect(count).toHaveBeenCalledWith({ where: whereEsperado });
    expect(aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: whereEsperado, _sum: { monto: true } }),
    );
  });

  it('totalMonto sale del _sum del aggregate', async () => {
    const { prisma } = buildPrisma('4200.50');
    const useCase = new ListarDonativosDineroUseCase(prisma);

    const res = await useCase.execute({});

    expect(res.totalMonto).toBe(4200.5);
  });

  it('totalMonto es 0 cuando el _sum es null (sin filas)', async () => {
    const { prisma } = buildPrisma(null);
    const useCase = new ListarDonativosDineroUseCase(prisma);

    const res = await useCase.execute({});

    expect(res.totalMonto).toBe(0);
  });
});
