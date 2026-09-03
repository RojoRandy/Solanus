import { Prisma } from '@prisma/client';
import { ProductoResponseDto } from '../dto/producto.dto';

/** Select reutilizado por los casos de uso de Producto (sin stock: eso vive en la variante). */
export const PRODUCTO_SELECT = {
  id: true,
  nombre: true,
  codigoBarras: true,
  activo: true,
  createdAt: true,
  categoria: { select: { id: true, nombre: true } },
} satisfies Prisma.ProductoSelect;

type ProductoConCategoria = Prisma.ProductoGetPayload<{
  select: typeof PRODUCTO_SELECT;
}>;

export function mapProducto(producto: ProductoConCategoria): ProductoResponseDto {
  return {
    id: producto.id,
    nombre: producto.nombre,
    codigoBarras: producto.codigoBarras,
    categoria: producto.categoria,
    activo: producto.activo,
    createdAt: producto.createdAt,
  };
}
