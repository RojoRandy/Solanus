import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  ActualizarCfdiEntradaDto,
  EntradaCfdiResponseDto,
} from '../dto/entrada.dto';

export interface ActualizarCfdiEntradaArgs {
  id: number;
  dto: ActualizarCfdiEntradaDto;
}

@Injectable()
export class ActualizarCfdiEntradaUseCase implements UseCase<
  ActualizarCfdiEntradaArgs,
  EntradaCfdiResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarCfdiEntradaArgs): Promise<EntradaCfdiResponseDto> {
    const existente = await this.prisma.entradaInventario.findUnique({
      where: { id },
    });
    if (!existente) throw InventarioErrors.Exceptions.ENTRADA_NOT_FOUND({ id });

    return this.prisma.entradaInventario.update({
      where: { id },
      data: { cfdi: dto.cfdi?.trim() || null },
      select: { id: true, cfdi: true },
    });
  }
}
