import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ActualizarCfdiEntradaUseCase } from './actualizar-cfdi-entrada.usecase';

function crearPrismaMock() {
  const entradaInventario = {
    findUnique: jest.fn().mockResolvedValue({ id: 50, cfdi: null }),
    update: jest.fn().mockImplementation(({ where, data }) => ({
      id: where.id,
      cfdi: data.cfdi,
    })),
  };
  const prisma = { entradaInventario } as unknown as PrismaService;
  return { prisma, entradaInventario };
}

describe('ActualizarCfdiEntradaUseCase', () => {
  it('actualiza el CFDI de una entrada existente sin espacios en los extremos', async () => {
    const { prisma, entradaInventario } = crearPrismaMock();
    const resultado = await new ActualizarCfdiEntradaUseCase(prisma).execute({
      id: 50,
      dto: { cfdi: '  CFDI-123  ' },
    });

    expect(entradaInventario.findUnique).toHaveBeenCalledWith({
      where: { id: 50 },
    });
    expect(entradaInventario.update).toHaveBeenCalledWith({
      where: { id: 50 },
      data: { cfdi: 'CFDI-123' },
      select: { id: true, cfdi: true },
    });
    expect(resultado).toEqual({ id: 50, cfdi: 'CFDI-123' });
  });

  it.each(['', '   ', null])('guarda null cuando el CFDI es %j', async (cfdi) => {
    const { prisma, entradaInventario } = crearPrismaMock();
    const resultado = await new ActualizarCfdiEntradaUseCase(prisma).execute({
      id: 50,
      dto: { cfdi },
    });

    expect(entradaInventario.update).toHaveBeenCalledWith({
      where: { id: 50 },
      data: { cfdi: null },
      select: { id: true, cfdi: true },
    });
    expect(resultado).toEqual({ id: 50, cfdi: null });
  });

  it('lanza ENTRADA_NOT_FOUND cuando la entrada no existe', async () => {
    const { prisma, entradaInventario } = crearPrismaMock();
    entradaInventario.findUnique.mockResolvedValue(null);
    const resultado = new ActualizarCfdiEntradaUseCase(prisma).execute({
      id: 50,
      dto: { cfdi: 'CFDI-123' },
    });

    await expect(resultado).rejects.toBeInstanceOf(NotFoundException);
    await expect(resultado).rejects.toMatchObject({
      status: 404,
      response: {
        code: 'ENTRADA_NOT_FOUND',
        description: 'No se encontró la entrada de inventario',
        data: { id: 50 },
      },
    });
    expect(entradaInventario.update).not.toHaveBeenCalled();
  });
});
