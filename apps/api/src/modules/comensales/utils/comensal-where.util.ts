import { Prisma } from '@prisma/client';
import type { ListarComensalesQueryDto } from '../dto/comensal.dto';
import { rangoFechaNacimiento } from './edad.util';

/** Filtros compartidos por el listado paginado y las exportaciones (xlsx/pdf). */
export type FiltrosComensales = Pick<
  ListarComensalesQueryDto,
  'activo' | 'busqueda' | 'grupoEdad' | 'ordenarPor' | 'orden'
>;

export function construirWhereComensales(
  query: FiltrosComensales,
): Prisma.ComensalWhereInput {
  const where: Prisma.ComensalWhereInput = {
    activo: query.activo === undefined ? true : query.activo === 'true',
  };

  const busqueda = query.busqueda?.trim();
  if (busqueda) {
    const folioBuscado = Number(busqueda);
    where.OR = [
      { nombres: { contains: busqueda, mode: 'insensitive' } },
      { apellidos: { contains: busqueda, mode: 'insensitive' } },
      ...(Number.isInteger(folioBuscado) ? [{ folio: folioBuscado }] : []),
    ];
  }

  if (query.grupoEdad) {
    where.fechaNacimiento = rangoFechaNacimiento(query.grupoEdad);
  }

  return where;
}

export function construirOrderByComensales(
  query: FiltrosComensales,
): Prisma.ComensalOrderByWithRelationInput[] {
  const orden = query.orden ?? 'desc';
  return query.ordenarPor === 'nombre'
    ? [{ nombres: orden }, { apellidos: orden }]
    : [{ folio: orden }];
}

/** Tope de filas por exportación: ~13× el padrón actual (≈379 comensales). */
export const LIMITE_EXPORTACION = 5000;
