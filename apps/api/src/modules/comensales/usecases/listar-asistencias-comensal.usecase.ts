import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { PaginatedDto, PaginationQueryDto, paginado, toSkipTake } from '@/common/dto/pagination.dto';
import { AsistenciaComensalResponseDto } from '../dto/comensal.dto';

export interface ListarAsistenciasComensalArgs {
  comensalId: number;
  query: PaginationQueryDto;
}

/** Historial de asistencias del comensal, más reciente primero — se muestra en su perfil. */
@Injectable()
export class ListarAsistenciasComensalUseCase implements UseCase<
  ListarAsistenciasComensalArgs,
  PaginatedDto<AsistenciaComensalResponseDto>
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    comensalId,
    query,
  }: ListarAsistenciasComensalArgs): Promise<PaginatedDto<AsistenciaComensalResponseDto>> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id: comensalId } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id: comensalId });

    const where = { comensalId };
    const { skip, take } = toSkipTake(query);

    const [asistencias, total] = await Promise.all([
      this.prisma.asistencia.findMany({
        where,
        orderBy: { turno: { fecha: 'desc' } },
        skip,
        take,
        select: {
          id: true,
          metodoCaptura: true,
          turno: { select: { fecha: true, horario: true } },
          registradoPor: { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.asistencia.count({ where }),
    ]);

    const items = asistencias.map((a) => ({
      id: a.id,
      fecha: a.turno.fecha,
      horario: a.turno.horario,
      metodoCaptura: a.metodoCaptura,
      registradoPor: a.registradoPor,
    }));

    return paginado(items, total, query);
  }
}
