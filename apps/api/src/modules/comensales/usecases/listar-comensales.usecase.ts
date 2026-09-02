import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ComensalResponseDto,
  ListarComensalesQueryDto,
} from '../dto/comensal.dto';
import {
  comensalListSelect,
  mapComensalResponse,
} from '../utils/comensal-select.util';

@Injectable()
export class ListarComensalesUseCase implements UseCase<
  ListarComensalesQueryDto,
  ComensalResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarComensalesQueryDto,
  ): Promise<ComensalResponseDto[]> {
    const activo = query.activo === undefined ? true : query.activo === 'true';

    const where: Prisma.ComensalWhereInput = { activo };

    const busqueda = query.busqueda?.trim();
    if (busqueda) {
      const folioBuscado = Number(busqueda);
      where.OR = [
        { nombres: { contains: busqueda, mode: 'insensitive' } },
        { apellidos: { contains: busqueda, mode: 'insensitive' } },
        ...(Number.isInteger(folioBuscado) ? [{ folio: folioBuscado }] : []),
      ];
    }

    const comensales = await this.prisma.comensal.findMany({
      where,
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      select: comensalListSelect,
    });

    return comensales.map(mapComensalResponse);
  }
}
