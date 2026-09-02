import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { ComensalDetalleResponseDto } from '../dto/comensal.dto';
import {
  comensalDetalleSelect,
  mapComensalDetalleResponse,
} from '../utils/comensal-select.util';

@Injectable()
export class ObtenerComensalUseCase implements UseCase<
  number,
  ComensalDetalleResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<ComensalDetalleResponseDto> {
    const comensal = await this.prisma.comensal.findUnique({
      where: { id },
      select: comensalDetalleSelect,
    });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    return mapComensalDetalleResponse(comensal);
  }
}
