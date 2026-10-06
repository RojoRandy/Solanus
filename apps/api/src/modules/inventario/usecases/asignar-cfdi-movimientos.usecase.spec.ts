import { PrismaService } from '@/prisma/prisma.service';
import { AsignarCfdiMovimientosUseCase } from './asignar-cfdi-movimientos.usecase';

function mov(
  id: number,
  entradaId: number,
  bienhechorId: number | null,
  fecha = '2026-10-02T12:00:00Z',
) {
  return {
    id,
    fecha: new Date(fecha),
    lote: {
      entradaId,
      bienhechorId,
      entrada: { fechaIngreso: new Date(fecha.slice(0, 10)) },
    },
  };
}

function crearPrismaMock(
  movimientos: unknown[],
  cierre: { desde: Date; hasta: Date } | null = null,
) {
  const entradaInventario = {
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const prisma = {
    movimientoInventario: {
      findMany: jest.fn().mockResolvedValue(movimientos),
    },
    cierreInventario: { findFirst: jest.fn().mockResolvedValue(cierre) },
    entradaInventario,
  } as unknown as PrismaService;
  return { prisma, entradaInventario };
}

describe('AsignarCfdiMovimientosUseCase', () => {
  it('asigna el CFDI recortado a las entradas distintas de los movimientos', async () => {
    const { prisma, entradaInventario } = crearPrismaMock([
      mov(1, 50, 7),
      mov(2, 50, 7),
      mov(3, 51, 7),
    ]);
    const resultado = await new AsignarCfdiMovimientosUseCase(prisma).execute({
      movimientoIds: [1, 2, 3],
      cfdi: '  CFDI-9  ',
    });

    expect(entradaInventario.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [50, 51] } },
      data: { cfdi: 'CFDI-9' },
    });
    expect(resultado).toEqual({ entradas: [50, 51], cfdi: 'CFDI-9' });
  });

  it.each(['', '   ', null])(
    'guarda null cuando el CFDI es %j',
    async (cfdi) => {
      const { prisma, entradaInventario } = crearPrismaMock([mov(1, 50, null)]);
      await new AsignarCfdiMovimientosUseCase(prisma).execute({
        movimientoIds: [1],
        cfdi,
      });
      expect(entradaInventario.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { cfdi: null } }),
      );
    },
  );

  it('rechaza movimientos de bienhechores distintos', async () => {
    const { prisma, entradaInventario } = crearPrismaMock([
      mov(1, 50, 7),
      mov(2, 51, 8),
    ]);
    await expect(
      new AsignarCfdiMovimientosUseCase(prisma).execute({
        movimientoIds: [1, 2],
        cfdi: 'X',
      }),
    ).rejects.toMatchObject({
      status: 409,
      response: { code: 'CFDI_BIENHECHORES_DISTINTOS' },
    });
    expect(entradaInventario.updateMany).not.toHaveBeenCalled();
  });

  it('rechaza movimientos dentro de un periodo cerrado', async () => {
    const cierre = {
      desde: new Date('2026-10-01'),
      hasta: new Date('2026-10-31'),
    };
    const { prisma, entradaInventario } = crearPrismaMock(
      [mov(1, 50, 7)],
      cierre,
    );
    await expect(
      new AsignarCfdiMovimientosUseCase(prisma).execute({
        movimientoIds: [1],
        cfdi: 'X',
      }),
    ).rejects.toMatchObject({
      status: 409,
      response: { code: 'PERIODO_CERRADO' },
    });
    expect(entradaInventario.updateMany).not.toHaveBeenCalled();
  });

  it('rechaza movimientos sin lote', async () => {
    const { prisma } = crearPrismaMock([
      { id: 1, fecha: new Date(), lote: null },
    ]);
    await expect(
      new AsignarCfdiMovimientosUseCase(prisma).execute({
        movimientoIds: [1],
        cfdi: 'X',
      }),
    ).rejects.toMatchObject({
      status: 400,
      response: { code: 'MOVIMIENTO_SIN_LOTE', data: { ids: [1] } },
    });
  });

  it('rechaza ids inexistentes', async () => {
    const { prisma } = crearPrismaMock([mov(1, 50, 7)]);
    await expect(
      new AsignarCfdiMovimientosUseCase(prisma).execute({
        movimientoIds: [1, 99],
        cfdi: 'X',
      }),
    ).rejects.toMatchObject({
      status: 404,
      response: { code: 'MOVIMIENTO_NOT_FOUND', data: { ids: [99] } },
    });
  });
});
