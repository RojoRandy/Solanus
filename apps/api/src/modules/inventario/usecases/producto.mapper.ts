import { Prisma } from '@prisma/client';
import { ProductoResponseDto } from '../dto/producto.dto';

/** Select reutilizado por los casos de uso de Producto (sin stock: eso vive en la variante). */
export const PRODUCTO_SELECT = {
  id: true,
  nombre: true,
  activo: true,
  createdAt: true,
  unidad: { select: { id: true, nombre: true, abrevia: true } },
  estado: true,
  marca: true,
  granel: true,
  contenidoCantidad: true,
  contenidoUnidad: { select: { id: true, nombre: true, abrevia: true } },
  categoria: { select: { id: true, nombre: true } },
} satisfies Prisma.ProductoSelect;

type ProductoConCategoria = Prisma.ProductoGetPayload<{
  select: typeof PRODUCTO_SELECT;
}>;

export function mapProducto(
  producto: ProductoConCategoria,
): ProductoResponseDto {
  return {
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria,
    unidad: producto.unidad,
    estado: producto.estado,
    marca: producto.marca,
    granel: producto.granel,
    contenido:
      producto.contenidoCantidad === null || producto.contenidoUnidad === null
        ? null
        : {
            cantidad: Number(producto.contenidoCantidad),
            unidad: producto.contenidoUnidad,
          },
    activo: producto.activo,
    createdAt: producto.createdAt,
  };
}
