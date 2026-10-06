import {
  EstadoProducto,
  OrigenLote,
  Prisma,
  TipoMovimiento,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ListarMovimientosUseCase } from './listar-movimientos.usecase';

function crearMovimiento() {
  return {
    id: 1,
    loteId: 20,
    tipo: TipoMovimiento.SALIDA,
    cantidad: new Prisma.Decimal(3),
    turnoId: null,
    fecha: new Date('2026-10-02T12:00:00Z'),
    notas: null,
    editadoPorId: null,
    variante: {
      id: 2,
      estado: EstadoProducto.CRUDO,
      producto: { id: 3, nombre: 'Arroz' },
      unidad: { id: 4, abrevia: 'kg' },
    },
    motivo: { id: 5, nombre: 'Consumo' },
    registradoPor: { id: 6, nombre: 'Usuario' },
    lote: {
      entradaId: 50,
      costoUnitario: new Prisma.Decimal('10.5'),
      origen: OrigenLote.DONADO,
      bienhechor: { id: 7, nombre: 'Bienhechor' },
      entrada: { cfdi: 'CFDI-123' },
    },
  };
}

function crearPrismaMock(
  movimientos: unknown[] = [crearMovimiento()],
  cierres: { desde: Date; hasta: Date }[] = [],
) {
  const movimientoInventario = {
    findMany: jest.fn().mockResolvedValue(movimientos),
    count: jest.fn().mockResolvedValue(movimientos.length),
  };
  const cierreInventario = { findMany: jest.fn().mockResolvedValue(cierres) };
  const prisma = {
    movimientoInventario,
    cierreInventario,
  } as unknown as PrismaService;
  return { prisma, movimientoInventario };
}

describe('ListarMovimientosUseCase', () => {
  it('incluye el lote de una salida con el número de entrada y el costo del movimiento', async () => {
    const movimiento = crearMovimiento();
    const { prisma } = crearPrismaMock([movimiento]);
    const resultado = await new ListarMovimientosUseCase(prisma).execute();

    expect(resultado.items[0]).toEqual({
      id: movimiento.id,
      producto: movimiento.variante.producto,
      variante: {
        id: 2,
        estado: EstadoProducto.CRUDO,
        unidad: movimiento.variante.unidad,
      },
      loteId: 20,
      lote: {
        numero: 50,
        costoUnitario: 10.5,
        costoTotal: 31.5,
        origen: OrigenLote.DONADO,
        bienhechor: movimiento.lote.bienhechor,
        cfdi: 'CFDI-123',
      },
      tipo: TipoMovimiento.SALIDA,
      motivo: movimiento.motivo,
      cantidad: 3,
      turnoId: null,
      registradoPor: movimiento.registradoPor,
      fecha: movimiento.fecha,
      notas: null,
      editado: false,
      periodoCerrado: false,
    });
  });

  it.each([
    ['2026-09-01', '2026-09-30', false],
    ['2026-10-01', '2026-10-02', true],
    ['2026-10-02', '2026-10-31', true],
  ])(
    'marca periodoCerrado con un cierre del %s al %s → %s',
    async (desde, hasta, esperado) => {
      const { prisma } = crearPrismaMock(
        [crearMovimiento()],
        [
          {
            desde: new Date(`${desde}T00:00:00Z`),
            hasta: new Date(`${hasta}T00:00:00Z`),
          },
        ],
      );
      const resultado = await new ListarMovimientosUseCase(prisma).execute();

      expect(resultado.items[0].periodoCerrado).toBe(esperado);
    },
  );

  it.each([7, 0])(
    'filtra la consulta y el conteo por bienhechorId=%s cuando está presente',
    async (bienhechorId) => {
      const { prisma, movimientoInventario } = crearPrismaMock();
      await new ListarMovimientosUseCase(prisma).execute({ bienhechorId });

      for (const metodo of [
        movimientoInventario.findMany,
        movimientoInventario.count,
      ]) {
        expect(metodo).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ lote: { bienhechorId } }),
          }),
        );
      }
    },
  );

  it('omite el filtro de lote cuando no se proporciona bienhechorId', async () => {
    const { prisma, movimientoInventario } = crearPrismaMock();
    await new ListarMovimientosUseCase(prisma).execute();

    expect(
      movimientoInventario.findMany.mock.calls[0][0].where,
    ).not.toHaveProperty('lote');
    expect(
      movimientoInventario.count.mock.calls[0][0].where,
    ).not.toHaveProperty('lote');
  });

  it('devuelve lote null para un movimiento sin lote', async () => {
    const { prisma } = crearPrismaMock([
      { ...crearMovimiento(), loteId: null, lote: null },
    ]);
    const resultado = await new ListarMovimientosUseCase(prisma).execute();

    expect(resultado.items[0]).toMatchObject({ loteId: null, lote: null });
  });

  it('conserva los valores nulos de costo, bienhechor y CFDI', async () => {
    const movimiento = crearMovimiento();
    const { prisma } = crearPrismaMock([
      {
        ...movimiento,
        lote: {
          ...movimiento.lote,
          costoUnitario: null,
          bienhechor: null,
          entrada: { cfdi: null },
        },
      },
    ]);
    const resultado = await new ListarMovimientosUseCase(prisma).execute();

    expect(resultado.items[0].lote).toMatchObject({
      costoUnitario: null,
      costoTotal: null,
      bienhechor: null,
      cfdi: null,
    });
  });

  it.each([
    ['-1.005', '1', 1.01],
    ['3', '0', 0],
  ])(
    'usa el valor absoluto de %s y redondea el costo unitario %s a dos decimales',
    async (cantidad, costoUnitario, costoTotal) => {
      const movimiento = crearMovimiento();
      const { prisma } = crearPrismaMock([
        {
          ...movimiento,
          cantidad: new Prisma.Decimal(cantidad),
          lote: {
            ...movimiento.lote,
            costoUnitario: new Prisma.Decimal(costoUnitario),
          },
        },
      ]);
      const resultado = await new ListarMovimientosUseCase(prisma).execute();

      expect(resultado.items[0].lote?.costoTotal).toBe(costoTotal);
    },
  );
});
