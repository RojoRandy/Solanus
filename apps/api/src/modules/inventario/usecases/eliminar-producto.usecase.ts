import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';

/** Baja lógica: un producto con historial de variantes/lotes nunca se borra físicamente. */
@Injectable()
export class EliminarProductoUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id });

    await this.prisma.producto.update({ where: { id }, data: { activo: false } });
  }
}
