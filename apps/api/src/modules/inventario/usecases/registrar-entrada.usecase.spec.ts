import { EstadoProducto, OrigenLote, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { RegistrarEntradaDto } from '../dto/entrada.dto';
import { RegistrarEntradaUseCase } from './registrar-entrada.usecase';

// Mock manual de la transacción, sin base de datos real.
function crearPrismaMock(granel = false, indicarContenido = false) {
  const producto = {
    id: 7,
    nombre: 'Leche',
    categoriaId: 1,
    unidadId: 42,
    estado: EstadoProducto.CRUDO,
    marca: 'Lala',
    granel,
    contenidoCantidad: null,
    contenidoUnidadId: null,
    activo: true,
    createdAt: new Date('2026-01-01'),
  };
  const tx = {
    producto: {
      findUnique: jest.fn().mockResolvedValue(producto),
      create: jest.fn().mockResolvedValue(producto),
    },
    categoriaInventario: {
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
    },
    unidadMedida: {
      findUnique: jest.fn().mockResolvedValue({ id: 42, indicarContenido }),
    },
    varianteInventario: {
      upsert: jest.fn().mockResolvedValue({ id: 11 }),
    },
    motivoMovimiento: {
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
    },
    loteInventario: {
      create: jest
        .fn()
        .mockImplementation(
          ({ data }: { data: Prisma.LoteInventarioUncheckedCreateInput }) => ({
            ...data,
            id: 100,
            variante: {
              id: 11,
              estado: producto.estado,
              producto: { nombre: producto.nombre },
              unidad: { abrevia: 'L' },
            },
            bienhechor: null,
          }),
        ),
    },
    movimientoInventario: {
      create: jest.fn().mockResolvedValue(undefined),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
  } as unknown as PrismaService;
  return { prisma, tx };
}

describe('RegistrarEntradaUseCase', () => {
  const dto: RegistrarEntradaDto = {
    productoId: 7,
    cantidadInicial: 20,
    costoUnitario: 5,
    noCaduca: true,
    origen: OrigenLote.COMPRADO,
  };
  const productoNuevo = {
    nombre: 'Leche',
    categoriaId: 1,
    unidadId: 42,
    estado: EstadoProducto.CRUDO,
    marca: 'Lala',
    granel: false,
  };

  it('usa la unidad, estado y marca del producto existente para registrar la entrada', async () => {
    const { prisma, tx } = crearPrismaMock();
    const resultado = await new RegistrarEntradaUseCase(prisma).execute({
      dto,
      registradoPorId: 99,
    });

    const datosVariante = {
      productoId: 7,
      unidadId: 42,
      estado: EstadoProducto.CRUDO,
    };
    expect(tx.varianteInventario.upsert).toHaveBeenCalledWith({
      where: { productoId_unidadId_estado: datosVariante },
      update: {},
      create: datosVariante,
      select: { id: true },
    });
    expect(tx.loteInventario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ marca: 'Lala', granel: false }),
      }),
    );
    expect(resultado.marca).toBe('Lala');
  });

  it('guarda marca null cuando el producto es a granel aunque tenga marca', async () => {
    const { prisma, tx } = crearPrismaMock(true);
    await new RegistrarEntradaUseCase(prisma).execute({
      dto,
      registradoPorId: 99,
    });

    expect(tx.loteInventario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ marca: null, granel: true }),
      }),
    );
  });

  it('crea el producto al vuelo con todos los campos y registra su lote', async () => {
    const { prisma, tx } = crearPrismaMock(false, true);
    const nuevo = {
      ...productoNuevo,
      contenidoCantidad: 1,
      contenidoUnidadId: 3,
    };
    await new RegistrarEntradaUseCase(prisma).execute({
      dto: { ...dto, productoId: undefined, productoNuevo: nuevo },
      registradoPorId: 99,
    });

    expect(tx.producto.create).toHaveBeenCalledWith({ data: nuevo });
    expect(tx.loteInventario.create).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      indicarContenido: true,
      contenido: {},
      error: 'CONTENIDO_REQUERIDO',
    },
    {
      indicarContenido: true,
      contenido: { contenidoCantidad: 1 },
      error: 'CONTENIDO_REQUERIDO',
    },
    {
      indicarContenido: true,
      contenido: { contenidoUnidadId: 3 },
      error: 'CONTENIDO_REQUERIDO',
    },
    {
      indicarContenido: false,
      contenido: { contenidoCantidad: 1 },
      error: 'CONTENIDO_NO_APLICA',
    },
    {
      indicarContenido: false,
      contenido: { contenidoUnidadId: 3 },
      error: 'CONTENIDO_NO_APLICA',
    },
  ])(
    'rechaza contenido inválido en el alta rápida: %j',
    async ({ indicarContenido, contenido, error }) => {
      const { prisma, tx } = crearPrismaMock(false, indicarContenido);
      await expect(
        new RegistrarEntradaUseCase(prisma).execute({
          dto: {
            ...dto,
            productoId: undefined,
            productoNuevo: { ...productoNuevo, ...contenido },
          },
          registradoPorId: 99,
        }),
      ).rejects.toMatchObject({ response: { code: error } });

      expect(tx.producto.create).not.toHaveBeenCalled();
      expect(tx.loteInventario.create).not.toHaveBeenCalled();
      expect(tx.movimientoInventario.create).not.toHaveBeenCalled();
    },
  );
});
