import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, MetodoCaptura } from '@prisma/client';
import { RegistrarAsistenciaUseCase } from './registrar-asistencia.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildPrismaMock(overrides: {
  turno?: { id: number } | null;
  comensal?: { id: number; activo: boolean } | null;
  createError?: unknown;
}) {
  const turno = 'turno' in overrides ? overrides.turno : { id: 1 };
  const comensal =
    'comensal' in overrides ? overrides.comensal : { id: 3, activo: true };

  const create = overrides.createError
    ? jest.fn().mockRejectedValue(overrides.createError)
    : jest.fn().mockResolvedValue({
        id: 10,
        metodoCaptura: MetodoCaptura.FOLIO,
        createdAt: new Date('2026-09-02'),
        comensal: {
          id: 3,
          folio: 3,
          nombres: 'María',
          apellidos: 'González',
          fotoPath: null,
        },
      });

  const prisma = {
    turnoComida: { findUnique: jest.fn().mockResolvedValue(turno) },
    comensal: { findUnique: jest.fn().mockResolvedValue(comensal) },
    asistencia: { create },
  } as unknown as PrismaService;

  return { prisma, create };
}

describe('RegistrarAsistenciaUseCase', () => {
  const args = { turnoId: 1, comensalId: 3, registradoPorId: 99 };

  it('registra la asistencia cuando el turno y el comensal existen', async () => {
    const { prisma, create } = buildPrismaMock({});
    const useCase = new RegistrarAsistenciaUseCase(prisma);

    const resultado = await useCase.execute(args);

    expect(resultado.comensal.folio).toBe(3);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        // expect.objectContaining() está tipado como `any` en @types/jest —
        // anidarlo dispara un falso positivo de no-unsafe-assignment.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          turnoId: 1,
          comensalId: 3,
          metodoCaptura: MetodoCaptura.FOLIO,
        }),
      }),
    );
  });

  it('lanza TURNO_NOT_FOUND cuando el turno no existe', async () => {
    const { prisma } = buildPrismaMock({ turno: null });
    const useCase = new RegistrarAsistenciaUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow(NotFoundException);
  });

  it('lanza error cuando el comensal no existe', async () => {
    const { prisma } = buildPrismaMock({ comensal: null });
    const useCase = new RegistrarAsistenciaUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow(NotFoundException);
  });

  it('lanza COMENSAL_INACTIVO cuando el comensal está dado de baja', async () => {
    const { prisma } = buildPrismaMock({ comensal: { id: 3, activo: false } });
    const useCase = new RegistrarAsistenciaUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow(BadRequestException);
  });

  it('traduce la violación de índice único (P2002) a ASISTENCIA_YA_REGISTRADA', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );
    const { prisma } = buildPrismaMock({ createError: p2002 });
    const useCase = new RegistrarAsistenciaUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow(BadRequestException);
  });

  it('deja pasar sin traducir cualquier otro error inesperado', async () => {
    const { prisma } = buildPrismaMock({ createError: new Error('boom') });
    const useCase = new RegistrarAsistenciaUseCase(prisma);

    await expect(useCase.execute(args)).rejects.toThrow('boom');
  });
});
