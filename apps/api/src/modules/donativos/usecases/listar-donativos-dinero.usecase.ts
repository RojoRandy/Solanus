import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { paginado, toSkipTake } from '@/common/dto/pagination.dto';
import {
  ListaDonativosDineroResponseDto,
  ListarDonativosDineroQueryDto,
} from '../dto/donativo-dinero.dto';
import { DONATIVO_DINERO_SELECT, mapDonativoDinero } from './donativo-dinero.mapper';

@Injectable()
export class ListarDonativosDineroUseCase implements UseCase<
  ListarDonativosDineroQueryDto,
  ListaDonativosDineroResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarDonativosDineroQueryDto = {},
  ): Promise<ListaDonativosDineroResponseDto> {
    const where: Prisma.DonativoDineroWhereInput = {};

    if (query.bienhechorId) where.bienhechorId = query.bienhechorId;
    if (query.turnoId) where.turnoId = query.turnoId;
    if (query.metodoPago) where.metodoPago = query.metodoPago;
    if (query.desde || query.hasta) {
      where.fecha = {};
      if (query.desde) where.fecha.gte = new Date(query.desde);
      if (query.hasta) where.fecha.lte = new Date(query.hasta);
    }

    const { skip, take } = toSkipTake(query);
    const [donativos, total, agregado] = await Promise.all([
      this.prisma.donativoDinero.findMany({
        where,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        select: DONATIVO_DINERO_SELECT,
        skip,
        take,
      }),
      this.prisma.donativoDinero.count({ where }),
      this.prisma.donativoDinero.aggregate({ where, _sum: { monto: true } }),
    ]);

    const { items, meta } = paginado(donativos.map(mapDonativoDinero), total, query);
    return { items, meta, totalMonto: Number(agregado._sum.monto ?? 0) };
  }
}
