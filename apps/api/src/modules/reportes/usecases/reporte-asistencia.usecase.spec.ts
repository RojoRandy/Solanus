import { HorarioComida } from '@prisma/client';
import { ReporteAsistenciaUseCase } from './reporte-asistencia.usecase';
import { PrismaService } from '@/prisma/prisma.service';

function buildPrisma(asistencias: unknown[]) {
  const findMany = jest.fn().mockResolvedValue(asistencias);
  const prisma = { asistencia: { findMany } } as unknown as PrismaService;
  return { prisma, findMany };
}

describe('ReporteAsistenciaUseCase', () => {
  it('indexa el día con getUTCDate() — una fecha @db.Date del 12 cae en dias[11], no en dias[10] ni dias[12]', async () => {
    const { prisma } = buildPrisma([
      {
        comensalId: 1,
        comensal: { folio: 100, nombres: 'Juan', apellidos: 'Pérez' },
        turno: { fecha: new Date('2026-09-12T00:00:00.000Z'), horario: HorarioComida.COMIDA },
      },
    ]);
    const useCase = new ReporteAsistenciaUseCase(prisma);

    const res = await useCase.execute({ anio: 2026, mes: 9 });

    expect(res.comensales).toHaveLength(1);
    expect(res.comensales[0].dias[11]).toBe(1);
    expect(res.comensales[0].dias[10]).toBe(0);
    expect(res.comensales[0].dias[12]).toBe(0);
    expect(res.comensales[0].total).toBe(1);
    expect(res.totalesPorDia[11]).toBe(1);
  });

  it('acumula varios turnos del mismo comensal el mismo día', async () => {
    const { prisma } = buildPrisma([
      {
        comensalId: 1,
        comensal: { folio: 100, nombres: 'Juan', apellidos: 'Pérez' },
        turno: { fecha: new Date('2026-09-01T00:00:00.000Z'), horario: HorarioComida.DESAYUNO },
      },
      {
        comensalId: 1,
        comensal: { folio: 100, nombres: 'Juan', apellidos: 'Pérez' },
        turno: { fecha: new Date('2026-09-01T00:00:00.000Z'), horario: HorarioComida.COMIDA },
      },
    ]);
    const useCase = new ReporteAsistenciaUseCase(prisma);

    const res = await useCase.execute({ anio: 2026, mes: 9 });

    expect(res.comensales[0].dias[0]).toBe(2);
    expect(res.comensales[0].total).toBe(2);
    expect(res.totalesPorDia[0]).toBe(2);
    expect(res.desayuno).toBe(1);
    expect(res.comida).toBe(1);
    expect(res.totalAsistencias).toBe(2);
  });

  it('sin asistencias, devuelve la forma del periodo con arreglos vacíos/ceros', async () => {
    const { prisma } = buildPrisma([]);
    const useCase = new ReporteAsistenciaUseCase(prisma);

    const res = await useCase.execute({ anio: 2026, mes: 2 });

    expect(res.anio).toBe(2026);
    expect(res.mes).toBe(2);
    expect(res.diasDelMes).toBe(28);
    expect(res.comensales).toEqual([]);
    expect(res.totalesPorDia).toEqual(new Array(28).fill(0));
    expect(res.totalAsistencias).toBe(0);
  });

  it('filtra por el rango del periodo resuelto (gte/lt) sobre turno.fecha', async () => {
    const { prisma, findMany } = buildPrisma([]);
    const useCase = new ReporteAsistenciaUseCase(prisma);

    await useCase.execute({ anio: 2026, mes: 9 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          turno: {
            fecha: {
              gte: new Date(Date.UTC(2026, 8, 1)),
              lt: new Date(Date.UTC(2026, 9, 1)),
            },
          },
        },
      }),
    );
  });
});
