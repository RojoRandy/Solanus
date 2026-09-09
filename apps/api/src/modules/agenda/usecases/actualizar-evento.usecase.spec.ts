import { BadRequestException } from '@nestjs/common';
import { ActualizarEventoUseCase } from './actualizar-evento.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildPrismaMock(evento: { id: number; fechaHora: Date } | null) {
  const update = jest.fn().mockResolvedValue(undefined);
  const prisma = {
    eventoAgenda: {
      findUnique: jest.fn().mockResolvedValue(evento),
      update,
    },
  } as unknown as PrismaService;

  return { prisma, update };
}

describe('ActualizarEventoUseCase', () => {
  it('lanza EVENTO_PASADO_NO_EDITABLE al intentar editar un evento con fecha de ayer', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const { prisma, update } = buildPrismaMock({ id: 1, fechaHora: ayer });
    const useCase = new ActualizarEventoUseCase(prisma);

    await expect(
      useCase.execute({ id: 1, dto: { descripcion: 'Nueva descripción' } }),
    ).rejects.toThrow(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it('permite editar un evento de hoy o futuro', async () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const { prisma, update } = buildPrismaMock({ id: 1, fechaHora: manana });
    const useCase = new ActualizarEventoUseCase(prisma);

    await useCase.execute({ id: 1, dto: { descripcion: 'Nueva descripción' } });

    expect(update).toHaveBeenCalledTimes(1);
  });
});
