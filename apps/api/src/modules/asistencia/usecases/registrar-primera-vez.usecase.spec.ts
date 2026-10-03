import { NotFoundException } from '@nestjs/common';
import { RegistrarPrimeraVezUseCase } from './registrar-primera-vez.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildPrismaMock(turno: { id: number } | null) {
  const create = jest.fn().mockResolvedValue({
    id: 5,
    nombre: 'Juan Pérez',
    createdAt: new Date('2026-10-02'),
  });
  const prisma = {
    turnoComida: { findUnique: jest.fn().mockResolvedValue(turno) },
    asistenciaPrimeraVez: { create },
  } as unknown as PrismaService;
  return { prisma, create };
}

describe('RegistrarPrimeraVezUseCase', () => {
  it('registra el nombre recortado cuando el turno existe', async () => {
    const { prisma, create } = buildPrismaMock({ id: 1 });
    const useCase = new RegistrarPrimeraVezUseCase(prisma);

    const resultado = await useCase.execute({
      turnoId: 1,
      nombre: '  Juan Pérez  ',
      registradoPorId: 99,
    });

    expect(resultado.nombre).toBe('Juan Pérez');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { turnoId: 1, nombre: 'Juan Pérez', registradoPorId: 99 },
      }),
    );
  });

  it('falla con 404 si el turno no existe', async () => {
    const { prisma, create } = buildPrismaMock(null);
    const useCase = new RegistrarPrimeraVezUseCase(prisma);

    await expect(
      useCase.execute({ turnoId: 1, nombre: 'Juan', registradoPorId: 99 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });
});
