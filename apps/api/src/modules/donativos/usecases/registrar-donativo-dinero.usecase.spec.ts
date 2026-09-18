import { NotFoundException } from '@nestjs/common';
import { RegistrarDonativoDineroUseCase } from './registrar-donativo-dinero.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildPrisma(overrides: {
  bienhechor?: { id: number } | null;
  turno?: { id: number } | null;
}) {
  const bienhechor = 'bienhechor' in overrides ? overrides.bienhechor : { id: 1 };
  const turno = 'turno' in overrides ? overrides.turno : { id: 7 };

  const create = jest.fn().mockImplementation(({ data }) => ({
    id: 10,
    monto: data.monto,
    fecha: data.fecha,
    metodoPago: data.metodoPago,
    folioRecibo: data.folioRecibo ?? null,
    nota: data.nota ?? null,
    createdAt: new Date('2026-09-08T12:00:00Z'),
    bienhechor: { id: data.bienhechorId, nombre: 'Central de Abasto' },
    turno: data.turnoId ? { id: data.turnoId, fecha: new Date('2026-09-08'), horario: 'COMIDA' } : null,
    registradoPor: { id: data.registradoPorId, nombre: 'Operativo' },
  }));

  const prisma = {
    bienhechor: { findUnique: jest.fn().mockResolvedValue(bienhechor) },
    turnoComida: { findUnique: jest.fn().mockResolvedValue(turno) },
    donativoDinero: { create },
    movimientoInventario: { create: jest.fn() },
    motivoMovimiento: { findUnique: jest.fn() },
  } as unknown as PrismaService;

  return { prisma, create };
}

describe('RegistrarDonativoDineroUseCase', () => {
  const dtoBase = {
    bienhechorId: 1,
    monto: 1500.5,
    metodoPago: 'EFECTIVO' as const,
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-08T15:30:00Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('crea el donativo con registradoPorId y usa la fecha de hoy cuando el DTO no la trae', async () => {
    const { prisma, create } = buildPrisma({});
    const useCase = new RegistrarDonativoDineroUseCase(prisma);

    const res = await useCase.execute({ dto: dtoBase, registradoPorId: 99 });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bienhechorId: 1,
          monto: 1500.5,
          metodoPago: 'EFECTIVO',
          registradoPorId: 99,
          fecha: new Date('2026-09-08T00:00:00.000Z'),
        }),
      }),
    );
    expect(res.monto).toBe(1500.5);
  });

  it('lanza BIENHECHOR_NOT_FOUND cuando el bienhechor no existe', async () => {
    const { prisma } = buildPrisma({ bienhechor: null });
    const useCase = new RegistrarDonativoDineroUseCase(prisma);

    await expect(
      useCase.execute({ dto: dtoBase, registradoPorId: 1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('no consulta el turno cuando turnoId es undefined', async () => {
    const { prisma } = buildPrisma({});
    const useCase = new RegistrarDonativoDineroUseCase(prisma);

    await useCase.execute({ dto: dtoBase, registradoPorId: 1 });

    expect(prisma.turnoComida.findUnique).not.toHaveBeenCalled();
  });

  it('lanza TURNO_NOT_FOUND cuando viene turnoId y el turno no existe', async () => {
    const { prisma } = buildPrisma({ turno: null });
    const useCase = new RegistrarDonativoDineroUseCase(prisma);

    await expect(
      useCase.execute({ dto: { ...dtoBase, turnoId: 7 }, registradoPorId: 1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('no toca inventario: ni MovimientoInventario ni MotivoMovimiento', async () => {
    const { prisma } = buildPrisma({});
    const useCase = new RegistrarDonativoDineroUseCase(prisma);

    await useCase.execute({ dto: { ...dtoBase, turnoId: 7 }, registradoPorId: 1 });

    expect(prisma.movimientoInventario.create).not.toHaveBeenCalled();
    expect(prisma.motivoMovimiento.findUnique).not.toHaveBeenCalled();
  });
});
