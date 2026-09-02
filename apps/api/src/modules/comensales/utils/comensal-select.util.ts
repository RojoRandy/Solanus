import { Prisma } from '@prisma/client';
import { calcularEdad } from './edad.util';
import {
  ComensalDetalleResponseDto,
  ComensalResponseDto,
} from '../dto/comensal.dto';

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
  menores: { select: tutorResumenSelect, orderBy: { apellidos: 'asc' } },
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
    menores: comensal.menores,
    cartaUsoImagen: comensal.cartaUsoImagen,
    updatedAt: comensal.updatedAt,
  };
}
