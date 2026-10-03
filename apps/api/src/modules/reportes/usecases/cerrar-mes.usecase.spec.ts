import { Prisma, TipoMovimiento } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CerrarMesUseCase } from './cerrar-mes.usecase';

const desde = new Date('2026-09-01T00:00:00.000Z');
const hasta = new Date('2026-09-30T00:00:00.000Z');
const args = { dto: { desde: '2026-09-01', hasta: '2026-09-30' }, cerradoPorId: 99 };

function buildPrismaMock() {
  const cierre = { id: 7, desde, hasta, cerradoPorId: 99, createdAt: new Date() };
  const tx = {
    cierreInventario: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(cierre),
    },
    motivoMovimiento: { findUnique: jest.fn().mockResolvedValue({ id: 8 }) },
    loteInventario: {
      findMany: jest.fn().mockResolvedValue([
        { id: 10, varianteId: 1, cantidadDisponible: new Prisma.Decimal('12.5') },
        { id: 20, varianteId: 2, cantidadDisponible: new Prisma.Decimal('3.125') },
      ]),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    movimientoInventario: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
  };
  const transaction = jest.fn((callback: (client: typeof tx) => unknown) => callback(tx));
  const prisma = { $transaction: transaction } as unknown as PrismaService;
  return { tx, cierre, transaction, useCase: new CerrarMesUseCase(prisma) };
}

describe('CerrarMesUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-03T18:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['2026-10-31', '2026-10-03'])(
    'rechaza el periodo no terminado hasta %s antes de abrir la transacción',
    async (fechaFinal) => {
      const { transaction, useCase } = buildPrismaMock();
      await expect(useCase.execute({
        ...args, dto: { desde: '2026-10-01', hasta: fechaFinal },
      })).rejects.toMatchObject({
        status: 400,
        response: {
          code: 'PERIODO_NO_TERMINADO',
          description: 'Solo se pueden cerrar periodos que ya terminaron; la fecha final debe ser anterior a hoy',
        },
      });
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it('permite cerrar hasta ayer, 2026-10-02', async () => {
    const { tx, transaction, useCase } = buildPrismaMock();
    await expect(useCase.execute({
      ...args, dto: { desde: '2026-10-01', hasta: '2026-10-02' },
    })).resolves.toMatchObject({ id: 7 });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(tx.cierreInventario.create).toHaveBeenCalledWith({
      data: {
        desde: new Date('2026-10-01T00:00:00.000Z'),
        hasta: new Date('2026-10-02T00:00:00.000Z'),
        cerradoPorId: 99,
      },
    });
  });

  it('ajusta dos lotes a cero con movimientos negativos y crea el cierre en una transacción', async () => {
    const { tx, transaction, useCase } = buildPrismaMock();

    await expect(useCase.execute(args)).resolves.toEqual({ id: 7, desde, hasta, lotesAjustados: 2 });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(tx.cierreInventario.findFirst).toHaveBeenCalledWith({
      where: { desde: { lte: hasta }, hasta: { gte: desde } },
    });
    expect(tx.motivoMovimiento.findUnique).toHaveBeenCalledWith({ where: { clave: 'CIERRE_MES' } });
    expect(tx.loteInventario.findMany).toHaveBeenCalledWith({ where: { cantidadDisponible: { gt: 0 } } });
    const movimiento = {
      tipo: TipoMovimiento.AJUSTE,
      motivoId: 8,
      fecha: hasta,
      registradoPorId: 99,
      notas: 'Cierre del 01/09/2026 al 30/09/2026',
    };
    expect(tx.movimientoInventario.createMany).toHaveBeenCalledTimes(1);
    expect(tx.movimientoInventario.createMany).toHaveBeenCalledWith({
      data: [
        { ...movimiento, loteId: 10, varianteId: 1, cantidad: new Prisma.Decimal('-12.5') },
        { ...movimiento, loteId: 20, varianteId: 2, cantidad: new Prisma.Decimal('-3.125') },
      ],
    });
    expect(tx.loteInventario.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 20] } }, data: { cantidadDisponible: 0 },
    });
    expect(tx.cierreInventario.create).toHaveBeenCalledWith({ data: { desde, hasta, cerradoPorId: 99 } });
  });

  it('rechaza un traslape con CIERRE_TRASLAPADO y devuelve el cierre existente', async () => {
    const { tx, cierre, useCase } = buildPrismaMock();
    tx.cierreInventario.findFirst.mockResolvedValue(cierre);

    await expect(useCase.execute(args)).rejects.toMatchObject({
      status: 409, response: { code: 'CIERRE_TRASLAPADO', data: cierre },
    });
    expect(tx.movimientoInventario.createMany).not.toHaveBeenCalled();
    expect(tx.loteInventario.updateMany).not.toHaveBeenCalled();
    expect(tx.cierreInventario.create).not.toHaveBeenCalled();
  });

  it('rechaza desde posterior a hasta con RANGO_CIERRE_INVALIDO', async () => {
    const { transaction, useCase } = buildPrismaMock();

    await expect(useCase.execute({
      ...args, dto: { desde: '2026-11-01', hasta: '2026-09-30' },
    })).rejects.toMatchObject({ status: 400, response: { code: 'RANGO_CIERRE_INVALIDO' } });
    expect(transaction).not.toHaveBeenCalled();
  });

  it('reusa MOTIVO_NOT_FOUND sin modificar existencias si falta CIERRE_MES', async () => {
    const { tx, useCase } = buildPrismaMock();
    tx.motivoMovimiento.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(args)).rejects.toMatchObject({
      status: 404, response: { code: 'MOTIVO_NOT_FOUND' },
    });
    expect(tx.movimientoInventario.createMany).not.toHaveBeenCalled();
    expect(tx.loteInventario.updateMany).not.toHaveBeenCalled();
    expect(tx.cierreInventario.create).not.toHaveBeenCalled();
  });

  it('registra un cierre sin movimientos cuando no hay existencias', async () => {
    const { tx, useCase } = buildPrismaMock();
    tx.loteInventario.findMany.mockResolvedValue([]);

    await expect(useCase.execute(args)).resolves.toEqual({ id: 7, desde, hasta, lotesAjustados: 0 });
    expect(tx.movimientoInventario.createMany).not.toHaveBeenCalled();
    expect(tx.loteInventario.updateMany).not.toHaveBeenCalled();
    expect(tx.cierreInventario.create).toHaveBeenCalledTimes(1);
  });
});
