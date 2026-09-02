import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';

/** Baja lógica: un bienhechor con lotes donados en su historial nunca se borra físicamente. */
@Injectable()
export class EliminarBienhechorUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const bienhechor = await this.prisma.bienhechor.findUnique({
      where: { id },
    });
    if (!bienhechor)
      throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({ id });

    await this.prisma.bienhechor.update({
      where: { id },
      data: { activo: false },
    });
  }
}
