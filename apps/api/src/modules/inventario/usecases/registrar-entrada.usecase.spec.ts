import { EstadoProducto, OrigenLote, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { RegistrarEntradaDto, LineaEntradaDto } from '../dto/entrada.dto';
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
  let siguienteLoteId = 100;
  const entrada = {
    id: 50,
    fechaIngreso: new Date('2026-10-02T00:00:00.000Z'),
    origen: OrigenLote.COMPRADO,
    bienhechorId: null,
    cfdi: 'CFDI-123',
  };
  const tx = {
    cierreInventario: { findFirst: jest.fn().mockResolvedValue(null) },
    entradaInventario: {
      create: jest
        .fn()
        .mockImplementation(({ data }) => Object.assign(entrada, data)),
    },
    bienhechor: { findUnique: jest.fn().mockResolvedValue({ id: 3 }) },
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
            id: siguienteLoteId++,
            presentacion: null,
            entrada: { id: entrada.id, cfdi: entrada.cfdi },
            costoUnitario: data.costoUnitario ?? null,
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

const cierreOctubre = {
  desde: new Date('2026-10-01T00:00:00.000Z'),
  hasta: new Date('2026-10-31T00:00:00.000Z'),
};

function buscarCierreOctubre({ where }: {
  where: { desde: { lte: Date }; hasta: { gte: Date } };
}) {
  return Promise.resolve(
    cierreOctubre.desde <= where.desde.lte &&
    cierreOctubre.hasta >= where.hasta.gte ? cierreOctubre : null,
  );
}

describe('RegistrarEntradaUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-03T18:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const linea: LineaEntradaDto = {
    productoId: 7,
    cantidad: 20,
    costoUnitario: 5,
    noCaduca: true,
  };
  const dto: RegistrarEntradaDto = {
    origen: OrigenLote.COMPRADO,
    fechaIngreso: '2026-10-02',
    cfdi: 'CFDI-123',
    lineas: [linea],
  };
  const productoNuevo = {
    nombre: 'Leche',
    categoriaId: 1,
    unidadId: 42,
    estado: EstadoProducto.CRUDO,
    marca: 'Lala',
    granel: false,
  };

  it('rechaza un periodo cerrado sin crear registros', async () => {
    const { prisma, tx } = crearPrismaMock();
    const cierre = {
      desde: new Date('2026-10-01T00:00:00.000Z'),
      hasta: new Date('2026-10-31T00:00:00.000Z'),
    };
    tx.cierreInventario.findFirst.mockImplementation(buscarCierreOctubre);

    await expect(
      new RegistrarEntradaUseCase(prisma).execute({
        dto: { ...dto, fechaIngreso: '2026-10-15' }, registradoPorId: 99,
      }),
    ).rejects.toMatchObject({
      status: 409,
      response: {
        code: 'PERIODO_CERRADO',
        description: 'El periodo del 01/10/2026 al 31/10/2026 está cerrado; no se pueden registrar ni editar movimientos en él',
        data: cierre,
      },
    });
    expect(tx.cierreInventario.findFirst).toHaveBeenCalledWith({
      where: {
        desde: { lte: new Date('2026-10-15T00:00:00.000Z') },
        hasta: { gte: new Date('2026-10-15T00:00:00.000Z') },
      },
    });
    expect(tx.entradaInventario.create).not.toHaveBeenCalled();
    expect(tx.producto.create).not.toHaveBeenCalled();
    expect(tx.varianteInventario.upsert).not.toHaveBeenCalled();
    expect(tx.loteInventario.create).not.toHaveBeenCalled();
    expect(tx.movimientoInventario.create).not.toHaveBeenCalled();
  });

  it('registra la entrada de noviembre con su fecha aunque octubre esté cerrado', async () => {
    const { prisma, tx } = crearPrismaMock();
    tx.cierreInventario.findFirst.mockImplementation(buscarCierreOctubre);

    await expect(new RegistrarEntradaUseCase(prisma).execute({
      dto: { ...dto, fechaIngreso: '2026-11-05' }, registradoPorId: 99,
    })).resolves.toMatchObject({ entradaId: 50 });

    expect(tx.cierreInventario.findFirst).toHaveBeenCalledTimes(1);
    expect(tx.cierreInventario.findFirst).toHaveBeenCalledWith({
      where: {
        desde: { lte: new Date('2026-11-05T00:00:00.000Z') },
        hasta: { gte: new Date('2026-11-05T00:00:00.000Z') },
      },
    });
    expect(tx.movimientoInventario.create).toHaveBeenCalledTimes(1);
    expect(tx.movimientoInventario.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ fecha: new Date('2026-11-05T00:00:00.000Z') }),
    });
  });

  it('registra una compra con dos líneas en una sola entrada', async () => {
    const { prisma, tx } = crearPrismaMock();
    const lineas = [linea, { ...linea, cantidad: 8, costoUnitario: 3 }];
    const resultado = await new RegistrarEntradaUseCase(prisma).execute({
      dto: { ...dto, lineas },
      registradoPorId: 99,
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.entradaInventario.create).toHaveBeenCalledTimes(1);
    expect(tx.entradaInventario.create).toHaveBeenCalledWith({
      data: {
        fechaIngreso: new Date('2026-10-02T00:00:00.000Z'),
        origen: OrigenLote.COMPRADO,
        bienhechorId: undefined,
        cfdi: 'CFDI-123',
      },
    });
    expect(tx.loteInventario.create).toHaveBeenCalledTimes(2);
    expect(tx.movimientoInventario.create).toHaveBeenCalledTimes(2);
    lineas.forEach((item, index) => {
      expect(tx.loteInventario.create).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          data: expect.objectContaining({
            entradaId: 50,
            cantidadInicial: item.cantidad,
            cantidadDisponible: item.cantidad,
            costoUnitario: item.costoUnitario,
          }),
          select: expect.objectContaining({
            entrada: { select: { id: true, cfdi: true } },
          }),
        }),
      );
      expect(tx.movimientoInventario.create).toHaveBeenNthCalledWith(
        index + 1,
        {
          data: expect.objectContaining({
            loteId: 100 + index,
            tipo: 'ENTRADA',
            cantidad: item.cantidad,
            registradoPorId: 99,
          }),
        },
      );
    });
    expect(resultado).toEqual({
      entradaId: 50,
      lotes: lineas.map((item, index) =>
        expect.objectContaining({
          id: 100 + index,
          entradaId: 50,
          cfdi: 'CFDI-123',
          cantidadInicial: item.cantidad,
        }),
      ),
    });
  });

  it.each([
    {
      dto: { ...dto, origen: OrigenLote.DONADO },
      error: 'BIENHECHOR_REQUERIDO',
    },
    {
      dto: { ...dto, lineas: [linea, { ...linea, costoUnitario: undefined }] },
      error: 'COSTO_UNITARIO_REQUERIDO',
    },
    {
      dto: { ...dto, lineas: [{ ...linea, noCaduca: undefined }] },
      error: 'CADUCIDAD_REQUERIDA',
    },
    {
      dto: { ...dto, lineas: [{ ...linea, productoId: undefined }] },
      error: 'PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO',
    },
  ])('rechaza una entrada inválida con $error', async ({ dto, error }) => {
    const { prisma, tx } = crearPrismaMock();
    await expect(
      new RegistrarEntradaUseCase(prisma).execute({ dto, registradoPorId: 99 }),
    ).rejects.toMatchObject({ response: { code: error } });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(tx.entradaInventario.create).not.toHaveBeenCalled();
    expect(tx.loteInventario.create).not.toHaveBeenCalled();
    expect(tx.movimientoInventario.create).not.toHaveBeenCalled();
  });

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
    expect(resultado.lotes[0].marca).toBe('Lala');
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
      dto: {
        ...dto,
        lineas: [{ ...linea, productoId: undefined, productoNuevo: nuevo }],
      },
      registradoPorId: 99,
    });

    expect(tx.producto.create).toHaveBeenCalledWith({
      data: { ...nuevo, claveSat: null },
    });
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
            lineas: [
              {
                ...linea,
                productoId: undefined,
                productoNuevo: { ...productoNuevo, ...contenido },
              },
            ],
          },
          registradoPorId: 99,
        }),
      ).rejects.toMatchObject({ response: { code: error } });

      expect(tx.producto.create).not.toHaveBeenCalled();
      expect(tx.loteInventario.create).not.toHaveBeenCalled();
      expect(tx.movimientoInventario.create).not.toHaveBeenCalled();
    },
  );
  it.each([OrigenLote.COMPRADO, OrigenLote.DONADO])(
    'crea una cabecera, dos lotes y dos movimientos para %s',
    async (origen) => {
      const { prisma, tx } = crearPrismaMock();
      const resultado = await new RegistrarEntradaUseCase(prisma).execute({
        dto: {
          ...dto,
          origen,
          bienhechorId: 3,
          cfdi: 'FACT-1',
          ubicacion: 'A1',
          fechaIngreso: '2026-09-01',
          lineas: [
            linea,
            {
              ...linea,
              cantidad: 3,
              noCaduca: false,
              fechaCaducidad: '2027-01-01',
            },
          ],
        },
        registradoPorId: 99,
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.entradaInventario.create).toHaveBeenCalledTimes(1);
      expect(tx.entradaInventario.create).toHaveBeenCalledWith({
        data: {
          fechaIngreso: new Date('2026-09-01T00:00:00.000Z'),
          origen,
          bienhechorId: 3,
          cfdi: 'FACT-1',
        },
      });
      expect(tx.motivoMovimiento.findUnique).toHaveBeenCalledWith({
        where: {
          clave: origen === OrigenLote.COMPRADO ? 'COMPRA' : 'DONACION',
        },
      });
      expect(tx.loteInventario.create).toHaveBeenCalledTimes(2);
      expect(tx.movimientoInventario.create).toHaveBeenCalledTimes(2);
      expect(resultado.entradaId).toBe(50);
      expect(resultado.lotes).toHaveLength(2);
      expect(resultado.lotes[0]).toMatchObject({
        entradaId: 50,
        cfdi: 'FACT-1',
        costoTotal: 100,
        fechaCaducidad: null,
      });
      expect(resultado.lotes[1]).toMatchObject({
        entradaId: 50,
        cfdi: 'FACT-1',
        costoTotal: 15,
        fechaCaducidad: new Date('2027-01-01T00:00:00.000Z'),
      });
      for (const [args] of tx.loteInventario.create.mock.calls) {
        expect(args.data).toMatchObject({
          entradaId: 50,
          origen,
          bienhechorId: 3,
          ubicacion: 'A1',
          fechaIngreso: new Date('2026-09-01T00:00:00.000Z'),
        });
        expect(args.data).not.toHaveProperty('cfdi');
      }
      for (const [args] of tx.movimientoInventario.create.mock.calls) {
        expect(args.data).toMatchObject({
          tipo: 'ENTRADA',
          registradoPorId: 99,
        });
        expect(args.data.fecha.toISOString()).toMatch(/T00:00:00.000Z$/);
      }
    },
  );

  it.each([
    { cambios: { origen: OrigenLote.DONADO }, error: 'BIENHECHOR_REQUERIDO' },
    {
      cambios: { lineas: [linea, { ...linea, costoUnitario: undefined }] },
      error: 'COSTO_UNITARIO_REQUERIDO',
    },
    {
      cambios: { lineas: [{ ...linea, productoId: undefined }] },
      error: 'PRODUCTO_O_PRODUCTO_NUEVO_REQUERIDO',
    },
    {
      cambios: { lineas: [{ ...linea, noCaduca: false }] },
      error: 'CADUCIDAD_REQUERIDA',
    },
  ])('rechaza $error antes de escribir', async ({ cambios, error }) => {
    const { prisma, tx } = crearPrismaMock();
    await expect(
      new RegistrarEntradaUseCase(prisma).execute({
        dto: { ...dto, ...cambios },
        registradoPorId: 99,
      }),
    ).rejects.toMatchObject({ status: 400, response: { code: error } });
    expect(tx.entradaInventario.create).not.toHaveBeenCalled();
    expect(tx.loteInventario.create).not.toHaveBeenCalled();
  });

  it('rechaza un bienhechor inexistente', async () => {
    const { prisma, tx } = crearPrismaMock();
    tx.bienhechor.findUnique.mockResolvedValue(null);
    await expect(
      new RegistrarEntradaUseCase(prisma).execute({
        dto: { ...dto, bienhechorId: 3 },
        registradoPorId: 99,
      }),
    ).rejects.toMatchObject({ response: { code: 'BIENHECHOR_NOT_FOUND' } });
    expect(tx.entradaInventario.create).not.toHaveBeenCalled();
  });

  it('permite donaciones sin costo y conserva claveSat del alta al vuelo', async () => {
    const { prisma, tx } = crearPrismaMock();
    const resultado = await new RegistrarEntradaUseCase(prisma).execute({
      dto: {
        origen: OrigenLote.DONADO,
        bienhechorId: 3,
        lineas: [
          {
            cantidad: 1,
            noCaduca: true,
            productoNuevo: { ...productoNuevo, claveSat: '50131700' },
          },
        ],
      },
      registradoPorId: 99,
    });
    expect(tx.producto.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ claveSat: '50131700' }),
    });
    expect(resultado.lotes[0]).toMatchObject({
      costoTotal: null,
      costoUnitario: null,
    });
  });
});
