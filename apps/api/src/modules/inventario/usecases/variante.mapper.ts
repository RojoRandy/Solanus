import { Prisma } from '@prisma/client';
import { VarianteResponseDto } from '../dto/variante.dto';

/**
 * Select reutilizado por todos los casos de uso que devuelven una variante con
 * su existencia — concentra en un solo lugar el cálculo de stockActual, que
 * antes vivía repetido en 4-5 usecases distintos.
 */
export const VARIANTE_SELECT_CON_LOTES = {
  id: true,
  estado: true,
  stockMinimo: true,
  activo: true,
  producto: { select: { id: true, nombre: true, categoria: { select: { id: true, nombre: true } } } },
  unidad: { select: { id: true, nombre: true, abrevia: true } },
  lotes: { select: { cantidadDisponible: true } },
} satisfies Prisma.VarianteInventarioSelect;

type VarianteConLotes = Prisma.VarianteInventarioGetPayload<{
  select: typeof VARIANTE_SELECT_CON_LOTES;
}>;

export function mapVariante(variante: VarianteConLotes): VarianteResponseDto {
  const stockActual = variante.lotes.reduce(
    (total, lote) => total + Number(lote.cantidadDisponible),
    0,
  );
  const stockMinimo = Number(variante.stockMinimo);

  return {
    id: variante.id,
    producto: variante.producto,
    categoria: variante.producto.categoria,
    unidad: variante.unidad,
    estado: variante.estado,
    stockActual,
    stockMinimo,
    stockBajo: stockActual < stockMinimo,
    activo: variante.activo,
  };
}
