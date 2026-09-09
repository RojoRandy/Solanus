import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginatedDto, paginado, toSkipTake } from '@/common/dto/pagination.dto';
import {
  ComensalResponseDto,
  ListarComensalesQueryDto,
} from '../dto/comensal.dto';
import {
  comensalListSelect,
  mapComensalResponse,
} from '../utils/comensal-select.util';
import {
  construirOrderByComensales,
  construirWhereComensales,
} from '../utils/comensal-where.util';

@Injectable()
export class ListarComensalesUseCase implements UseCase<
  ListarComensalesQueryDto,
  PaginatedDto<ComensalResponseDto>
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarComensalesQueryDto,
  ): Promise<PaginatedDto<ComensalResponseDto>> {
    const where = construirWhereComensales(query);
    const orderBy = construirOrderByComensales(query);

    const { skip, take } = toSkipTake(query);
    const [comensales, total] = await Promise.all([
      this.prisma.comensal.findMany({
        where,
        orderBy,
        select: comensalListSelect,
        skip,
        take,
      }),
      this.prisma.comensal.count({ where }),
    ]);

    return paginado(comensales.map(mapComensalResponse), total, query);
  }
}
