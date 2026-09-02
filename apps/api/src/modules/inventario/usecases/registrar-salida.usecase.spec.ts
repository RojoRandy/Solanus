import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegistrarSalidaInventarioUseCase } from './registrar-salida.usecase';
import { PrismaService } from '@/prisma/prisma.service';

// Mock mínimo de PrismaService: sin base de datos real, solo simula las
// llamadas que el caso de uso hace dentro de $transaction(tx => ...).
interface LoteMock {
  id: number;
  cantidadDisponible: number;
  fechaCaducidad: Date | null;
}

function buildPrismaMock(overrides: {
  item?: { id: number } | null;
  motivo?: { id: number } | null;
  lotes?: LoteMock[];
}) {
  const loteUpdate = jest.fn().mockResolvedValue(undefined);
  const movimientoCreate = jest.fn().mockResolvedValue(undefined);

  // 'item' in overrides distingue "no me lo pasaron" (usar el valor por defecto)
  // de "me pasaron null a propósito" (simular que no existe) — con `??` ambos
  // casos colapsarían al valor por defecto porque null también es nullish.
  const item = 'item' in overrides ? overrides.item : { id: 1 };
  const motivo = 'motivo' in overrides ? overrides.motivo : { id: 1 };

  const tx = {
    inventarioItem: {
      findUnique: jest.fn().mockResolvedValue(item),
    },
    motivoMovimiento: {
      findUnique: jest.fn().mockResolvedValue(motivo),
    },
    loteInventario: {
      findMany: jest.fn().mockResolvedValue(overrides.lotes ?? []),
      update: loteUpdate,
    },
    movimientoInventario: {
      create: movimientoCreate,
    },
  };

  const prisma = {
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
  } as unknown as PrismaService;

  return { prisma, tx, loteUpdate, movimientoCreate };
}

describe('RegistrarSalidaInventarioUseCase', () => {
  const args = {
    itemId: 1,
    cantidad: 10,
    motivoId: 1,
    registradoPorId: 99,
  };

  it('descuenta de un solo lote cuando alcanza para cubrir la cantidad', async () => {
    const { prisma, loteUpdate, movimientoCreate } = buildPrismaMock({
      lotes: [
        {
          id: 100,
          cantidadDisponible: 15,
          fechaCaducidad: new Date('2026-01-01'),
        },
      ],
    });
    const useCase = new RegistrarSalidaInventarioUseCase(prisma);

    const resultado = await useCase.execute(args);

    expect(resultado.cantidadDescontada).toBe(10);
    expect(resultado.lotesAfectados).toEqual([{ loteId: 100, cantidad: 10 }]);
    expect(loteUpdate).toHaveBeenCalledTimes(1);
    expect(loteUpdate).toHaveBeenCalledWith({
      where: { id: 100 },
      data: { cantidadDisponible: 5 },
    });
    expect(movimientoCreate).toHaveBeenCalledTimes(1);
  });

  it('reparte el descuento entre varios lotes en orden de caducidad (los que caducan primero se consumen primero)', async () => {
    const { prisma, loteUpdate, movimientoCreate } = buildPrismaMock({
      // findMany ya se asume ordenado por fechaCaducidad asc con nulls last,
      // tal como lo pide el caso de uso a Prisma — aquí solo verificamos que
      // el caso de uso respeta ese orden y reparte cantidad entre lotes.
      lotes: [
        {
          id: 1,
          cantidadDisponible: 4,
          fechaCaducidad: new Date('2026-01-01'),
        },
        {
          id: 2,
          cantidadDisponible: 3,
          fechaCaducidad: new Date('2026-02-01'),
        },
        { id: 3, cantidadDisponible: 10, fechaCaducidad: null },
      ],
    });
    const useCase = new RegistrarSalidaInventarioUseCase(prisma);

    const resultado = await useCase.execute({ ...args, cantidad: 10 });

    expect(resultado.lotesAfectados).toEqual([
      { loteId: 1, cantidad: 4 },
      { loteId: 2, cantidad: 3 },
      { loteId: 3, cantidad: 3 },
    ]);
    expect(loteUpdate).toHaveBeenCalledTimes(3);
    expect(loteUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      data: { cantidadDisponible: 0 },
    });
    expect(loteUpdate).toHaveBeenNthCalledWith(2, {
      where: { id: 2 },
      data: { cantidadDisponible: 0 },
    });
    expect(loteUpdate).toHaveBeenNthCalledWith(3, {
      where: { id: 3 },
      data: { cantidadDisponible: 7 },
    });
    expect(movimientoCreate).toHaveBeenCalledTimes(3);
  });

  it('lanza STOCK_INSUFICIENTE y no aplica ningún cambio cuando la existencia total no alcanza', async () => {
    const { prisma, loteUpdate, movimientoCreate } = buildPrismaMock({
      lotes: [{ id: 1, cantidadDisponible: 2, fechaCaducidad: null }],
    });
    const useCase = new RegistrarSalidaInventarioUseCase(prisma);

    await expect(useCase.execute({ ...args, cantidad: 10 })).rejects.toThrow(
      BadRequestException,
    );
    expect(loteUpdate).not.toHaveBeenCalled();
    expect(movimientoCreate).not.toHaveBeenCalled();
  });

  it('lanza CANTIDAD_INVALIDA cuando la cantidad solicitada es cero o negativa', async () => {
    const { prisma } = buildPrismaMock({});
    const useCase = new RegistrarSalidaInventarioUseCase(prisma);

    await expect(useCase.execute({ ...args, cantidad: 0 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('lanza ITEM_NOT_FOUND cuando el producto no existe', async () => {
    const { prisma } = buildPrismaMock({ item: null });
    const useCase = new RegistrarSalidaInventarioUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow(NotFoundException);
  });

  it('lanza MOTIVO_NOT_FOUND cuando el motivo no existe', async () => {
    const { prisma } = buildPrismaMock({ motivo: null });
    const useCase = new RegistrarSalidaInventarioUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow(NotFoundException);
  });
});
