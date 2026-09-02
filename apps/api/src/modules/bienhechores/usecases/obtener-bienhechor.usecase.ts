import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { BienhechorResponseDto } from '../dto/bienhechor.dto';

@Injectable()
export class ObtenerBienhechorUseCase implements UseCase<
  number,
  BienhechorResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<BienhechorResponseDto> {
    const bienhechor = await this.prisma.bienhechor.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rfc: true,
        activo: true,
        createdAt: true,
      },
    });
    if (!bienhechor)
      throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({ id });

    return bienhechor;
  }
}
