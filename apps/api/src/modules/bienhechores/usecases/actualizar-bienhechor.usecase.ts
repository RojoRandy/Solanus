import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  ActualizarBienhechorDto,
  BienhechorResponseDto,
} from '../dto/bienhechor.dto';

export interface ActualizarBienhechorArgs {
  id: number;
  dto: ActualizarBienhechorDto;
}

@Injectable()
export class ActualizarBienhechorUseCase implements UseCase<
  ActualizarBienhechorArgs,
  BienhechorResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarBienhechorArgs): Promise<BienhechorResponseDto> {
    const existente = await this.prisma.bienhechor.findUnique({
      where: { id },
    });
    if (!existente)
      throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({ id });

    return this.prisma.bienhechor.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        contacto: dto.contacto,
        rfc: dto.rfc,
        activo: dto.activo,
      },
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rfc: true,
        activo: true,
        createdAt: true,
      },
    });
  }
}
