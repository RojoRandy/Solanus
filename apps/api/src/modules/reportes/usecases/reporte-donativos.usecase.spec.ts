import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ReporteDonativosUseCase } from './reporte-donativos.usecase';

describe('ReporteDonativosUseCase', () => {
  it('cuenta entradas distintas y suma el costo de todos sus productos', async () => {
    const bienhechor = { id: 1, nombre: 'A' };
    const findMany = jest.fn().mockResolvedValue([
      { entradaId: 10, costoTotal: new Prisma.Decimal(21), bienhechor },
      { entradaId: 10, costoTotal: new Prisma.Decimal(12), bienhechor },
      { entradaId: 11, costoTotal: new Prisma.Decimal(5), bienhechor },
    ]);
    const prisma = { loteInventario: { findMany } } as unknown as PrismaService;
    const useCase = new ReporteDonativosUseCase(prisma);

    const resultado = await useCase.execute({
      desde: '2026-09-01',
      hasta: '2026-09-30',
    });

    expect(resultado).toEqual({
      totalLotes: 2,
      valorEstimado: 38,
      porBienhechor: [
        {
          bienhechorId: 1,
          bienhechor: 'A',
          cantidadLotes: 2,
          valorEstimado: 38,
        },
      ],
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          entradaId: true,
          costoTotal: true,
          bienhechor: { select: { id: true, nombre: true } },
        },
      }),
    );
  });
});
