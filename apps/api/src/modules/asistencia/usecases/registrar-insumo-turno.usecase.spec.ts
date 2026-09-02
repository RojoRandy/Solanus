import { NotFoundException } from '@nestjs/common';
import { RegistrarInsumoTurnoUseCase } from './registrar-insumo-turno.usecase';
import { RegistrarSalidaInventarioUseCase } from '../../inventario/usecases/registrar-salida.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildDeps(overrides: {
  turno?: { id: number } | null;
  motivo?: { id: number } | null;
}) {
  const turno = 'turno' in overrides ? overrides.turno : { id: 1 };
  const motivo =
    'motivo' in overrides
      ? overrides.motivo
      : { id: 5, nombre: 'Consumo en comida' };

  const prisma = {
    turnoComida: { findUnique: jest.fn().mockResolvedValue(turno) },
    motivoMovimiento: { findUnique: jest.fn().mockResolvedValue(motivo) },
  } as unknown as PrismaService;

  const execute = jest.fn().mockResolvedValue({
    itemId: 2,
    cantidadDescontada: 3,
    lotesAfectados: [],
  });
  const registrarSalida = {
    execute,
  } as unknown as RegistrarSalidaInventarioUseCase;

  return { prisma, registrarSalida, execute };
}

describe('RegistrarInsumoTurnoUseCase', () => {
  const args = { turnoId: 1, itemId: 2, cantidad: 3, registradoPorId: 99 };

  it('resuelve el motivo "Consumo en comida" por defecto y delega el descuento a RegistrarSalidaInventarioUseCase', async () => {
    const { prisma, registrarSalida, execute } = buildDeps({});
    const useCase = new RegistrarInsumoTurnoUseCase(prisma, registrarSalida);

    await useCase.execute(args);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 2,
        cantidad: 3,
        motivoId: 5,
        turnoId: 1,
        registradoPorId: 99,
      }),
    );
  });

  it('usa el motivoId explícito cuando se proporciona, sin resolverlo por nombre', async () => {
    const { prisma, registrarSalida, execute } = buildDeps({});
    const useCase = new RegistrarInsumoTurnoUseCase(prisma, registrarSalida);

    await useCase.execute({ ...args, motivoId: 9 });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ motivoId: 9 }),
    );
  });

  it('lanza TURNO_NOT_FOUND cuando el turno no existe', async () => {
    const { prisma, registrarSalida } = buildDeps({ turno: null });
    const useCase = new RegistrarInsumoTurnoUseCase(prisma, registrarSalida);

    await expect(useCase.execute(args)).rejects.toThrow(NotFoundException);
  });

  it('lanza MOTIVO_NOT_FOUND si el motivo "Consumo en comida" no está sembrado', async () => {
    const { prisma, registrarSalida } = buildDeps({ motivo: null });
    const useCase = new RegistrarInsumoTurnoUseCase(prisma, registrarSalida);

    await expect(useCase.execute(args)).rejects.toThrow(NotFoundException);
  });
});
