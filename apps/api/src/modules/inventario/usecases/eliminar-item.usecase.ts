import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';

/** Baja lógica: un producto con historial de lotes/movimientos nunca se borra físicamente. */
@Injectable()
export class EliminarInventarioItemUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const item = await this.prisma.inventarioItem.findUnique({
      where: { id },
    });
    if (!item) throw InventarioErrors.Exceptions.ITEM_NOT_FOUND({ id });

    await this.prisma.inventarioItem.update({
      where: { id },
      data: { activo: false },
    });
  }
}
