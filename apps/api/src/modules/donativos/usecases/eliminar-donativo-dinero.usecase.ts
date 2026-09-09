import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { DonativoErrors } from '@/common/errors/donativo.errors';

@Injectable()
export class EliminarDonativoDineroUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const donativo = await this.prisma.donativoDinero.findUnique({ where: { id } });
    if (!donativo) throw DonativoErrors.Exceptions.DONATIVO_DINERO_NOT_FOUND({ id });

    // ponytail: borrado duro; si contabilidad pide rastro, agregar anuladoEn/anuladoPorId
    // y filtrar en el listado en vez de eliminar la fila.
    await this.prisma.donativoDinero.delete({ where: { id } });
  }
}
