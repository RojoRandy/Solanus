import { Prisma } from '@prisma/client';
import { TurnoResponseDto, TurnoResumenResponseDto } from '../dto/turno.dto';

export const turnoDetalleSelect = {
  id: true,
  fecha: true,
  horario: true,
  menu: true,
  notas: true,
  asistencias: {
    select: {
      id: true,
      metodoCaptura: true,
      createdAt: true,
      comensal: {
        select: {
          id: true,
          folio: true,
          nombres: true,
          apellidos: true,
          fotoPath: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
  voluntarios: {
    select: {
      id: true,
      voluntario: {
        select: { id: true, nombres: true, apellidos: true, fotoPath: true },
      },
    },
  },
} satisfies Prisma.TurnoComidaSelect;

export type TurnoConDetalle = Prisma.TurnoComidaGetPayload<{
  select: typeof turnoDetalleSelect;
}>;

export function mapTurnoDetalle(turno: TurnoConDetalle): TurnoResponseDto {
  return {
    id: turno.id,
    fecha: turno.fecha,
    horario: turno.horario,
    menu: turno.menu,
    notas: turno.notas,
    totalAsistencias: turno.asistencias.length,
    asistencias: turno.asistencias.map((a) => ({
      id: a.id,
      metodoCaptura: a.metodoCaptura,
      createdAt: a.createdAt,
      comensal: a.comensal,
    })),
    voluntarios: turno.voluntarios.map((v) => ({
      id: v.id,
      voluntario: v.voluntario,
    })),
  };
}

export const turnoResumenSelect = {
  id: true,
  fecha: true,
  horario: true,
  _count: { select: { asistencias: true } },
} satisfies Prisma.TurnoComidaSelect;

export type TurnoConResumen = Prisma.TurnoComidaGetPayload<{
  select: typeof turnoResumenSelect;
}>;

export function mapTurnoResumen(
  turno: TurnoConResumen,
): TurnoResumenResponseDto {
  return {
    id: turno.id,
    fecha: turno.fecha,
    horario: turno.horario,
    totalAsistencias: turno._count.asistencias,
  };
}
