import { Genero, Prisma } from '@prisma/client';
import { calcularEdad } from './edad.util';
import {
  ComensalDetalleResponseDto,
  ComensalResponseDto,
} from '../dto/comensal.dto';

// Etiquetas usadas por las exportaciones y el expediente.
export const ETIQUETA_GENERO: Record<Genero, string> = {
  HOMBRE: 'Hombre',
  MUJER: 'Mujer',
  SIN_ESPECIFICAR: 'Sin especificar',
};

const tutorResumenSelect = {
  id: true,
  folio: true,
  nombres: true,
  apellidos: true,
} satisfies Prisma.ComensalSelect;

export const comensalListSelect = {
  id: true,
  folio: true,
  nombres: true,
  apellidos: true,
  fechaNacimiento: true,
  curp: true,
  genero: true,
  fotoPath: true,
  activo: true,
  createdAt: true,
  tutor: { select: tutorResumenSelect },
} satisfies Prisma.ComensalSelect;

export const comensalDetalleSelect = {
  ...comensalListSelect,
  ineFrontPath: true,
  ineBackPath: true,
  updatedAt: true,
  menores: {
    select: { ...tutorResumenSelect, activo: true, fechaNacimiento: true },
    orderBy: { apellidos: 'asc' },
  },
  cartaUsoImagen: {
    select: { id: true, autoriza: true, fechaFirma: true, firmanteId: true },
  },
} satisfies Prisma.ComensalSelect;

type ComensalListado = Prisma.ComensalGetPayload<{
  select: typeof comensalListSelect;
}>;

type ComensalDetalle = Prisma.ComensalGetPayload<{
  select: typeof comensalDetalleSelect;
}>;

export function mapComensalResponse(
  comensal: ComensalListado,
): ComensalResponseDto {
  return {
    id: comensal.id,
    folio: comensal.folio,
    nombres: comensal.nombres,
    apellidos: comensal.apellidos,
    fechaNacimiento: comensal.fechaNacimiento,
    edad: calcularEdad(comensal.fechaNacimiento),
    curp: comensal.curp,
    genero: comensal.genero,
    fotoPath: comensal.fotoPath,
    tutor: comensal.tutor,
    activo: comensal.activo,
    createdAt: comensal.createdAt,
  };
}

export function mapComensalDetalleResponse(
  comensal: ComensalDetalle,
): ComensalDetalleResponseDto {
  return {
    ...mapComensalResponse(comensal),
    ineFrontPath: comensal.ineFrontPath,
    ineBackPath: comensal.ineBackPath,
    menores: comensal.menores.map(({ id, folio, nombres, apellidos }) => ({
      id,
      folio,
      nombres,
      apellidos,
    })),
    menoresActivos: comensal.menores.filter((m) => m.activo).length,
    // Un menor que ya cumplió 18 no se reactiva en bloque: conserva un tutorId obsoleto.
    menoresInactivos: comensal.menores.filter(
      (m) => !m.activo && calcularEdad(m.fechaNacimiento) < 18,
    ).length,
    cartaUsoImagen: comensal.cartaUsoImagen,
    updatedAt: comensal.updatedAt,
  };
}
