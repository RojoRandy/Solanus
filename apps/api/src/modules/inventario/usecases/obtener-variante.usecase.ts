import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { VarianteResponseDto } from '../dto/variante.dto';
import { VARIANTE_SELECT_CON_LOTES, mapVariante } from './variante.mapper';

@Injectable()
export class ObtenerVarianteUseCase implements UseCase<number, VarianteResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<VarianteResponseDto> {
    const variante = await this.prisma.varianteInventario.findUnique({
      where: { id },
      select: VARIANTE_SELECT_CON_LOTES,
    });
    if (!variante) throw InventarioErrors.Exceptions.VARIANTE_NOT_FOUND({ id });

    return mapVariante(variante);
  }
}
