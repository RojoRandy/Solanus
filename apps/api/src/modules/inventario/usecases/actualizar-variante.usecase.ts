import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { ActualizarVarianteDto, VarianteResponseDto } from '../dto/variante.dto';
import { VARIANTE_SELECT_CON_LOTES, mapVariante } from './variante.mapper';

export interface ActualizarVarianteArgs {
  id: number;
  dto: ActualizarVarianteDto;
}

/** Usada por la pantalla de Configuración > Stock mínimo. */
@Injectable()
export class ActualizarVarianteUseCase implements UseCase<
  ActualizarVarianteArgs,
  VarianteResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, dto }: ActualizarVarianteArgs): Promise<VarianteResponseDto> {
    const existente = await this.prisma.varianteInventario.findUnique({ where: { id } });
    if (!existente) throw InventarioErrors.Exceptions.VARIANTE_NOT_FOUND({ id });

    const variante = await this.prisma.varianteInventario.update({
      where: { id },
      data: { stockMinimo: dto.stockMinimo, activo: dto.activo },
      select: VARIANTE_SELECT_CON_LOTES,
    });

    return mapVariante(variante);
  }
}
