import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';

/** Impide registrar o editar movimientos cuyo día UTC pertenece a un cierre. */
export async function validarPeriodoAbierto(
  tx: Prisma.TransactionClient | PrismaService,
  fecha: Date,
): Promise<void> {
  const dia = new Date(fecha);
  dia.setUTCHours(0, 0, 0, 0);
  const cierre = await tx.cierreInventario.findFirst({
    where: { desde: { lte: dia }, hasta: { gte: dia } },
  });
  if (cierre)
    throw InventarioErrors.Exceptions.PERIODO_CERRADO({
      desde: cierre.desde,
      hasta: cierre.hasta,
    });
}
