import { Prisma } from '@prisma/client';
import { InventarioItemResponseDto } from '../dto/item.dto';

/** Select reutilizado por todos los casos de uso que devuelven un InventarioItem con su stock. */
export const ITEM_SELECT_CON_LOTES = {
  id: true,
  nombre: true,
  marca: true,
  codigoBarras: true,
  presentacion: true,
  stockMinimo: true,
  activo: true,
  createdAt: true,
  categoria: { select: { id: true, nombre: true } },
  unidad: { select: { id: true, nombre: true, abrevia: true } },
  ubicacion: { select: { id: true, nombre: true } },
  lotes: { select: { cantidadDisponible: true } },
} satisfies Prisma.InventarioItemSelect;

type ItemConLotes = Prisma.InventarioItemGetPayload<{
  select: typeof ITEM_SELECT_CON_LOTES;
}>;

export function mapInventarioItem(
  item: ItemConLotes,
): InventarioItemResponseDto {
  const stockActual = item.lotes.reduce(
    (total, lote) => total + Number(lote.cantidadDisponible),
    0,
  );
  const stockMinimo = Number(item.stockMinimo);

  return {
    id: item.id,
    nombre: item.nombre,
    marca: item.marca,
    codigoBarras: item.codigoBarras,
    categoria: item.categoria,
    unidad: item.unidad,
    presentacion: item.presentacion,
    ubicacion: item.ubicacion,
    stockMinimo,
    stockActual,
    stockBajo: stockActual < stockMinimo,
    activo: item.activo,
    createdAt: item.createdAt,
  };
}
