import { EstadoProducto, Prisma } from '@prisma/client';
import { InventarioErrors } from '@/common/errors/inventario.errors';

/**
 * Encuentra o crea la variante (producto × unidad × estado). La usan
 * Registrar entrada y Registrar donativo, que dan de alta la combinación
 * "al vuelo" si todavía no existe — evita repetir la lógica de upsert.
 */
export async function upsertVariante(
  tx: Prisma.TransactionClient,
  args: { productoId: number; unidadId: number; estado: EstadoProducto },
): Promise<{ id: number }> {
  const unidad = await tx.unidadMedida.findUnique({ where: { id: args.unidadId } });
  if (!unidad) throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({ unidadId: args.unidadId });

  return tx.varianteInventario.upsert({
    where: {
      productoId_unidadId_estado: {
        productoId: args.productoId,
        unidadId: args.unidadId,
        estado: args.estado,
      },
    },
    update: {},
    create: {
      productoId: args.productoId,
      unidadId: args.unidadId,
      estado: args.estado,
    },
    select: { id: true },
  });
}
