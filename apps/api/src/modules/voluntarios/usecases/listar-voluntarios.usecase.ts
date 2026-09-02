import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ListarVoluntariosQueryDto,
  VoluntarioResponseDto,
} from '../dto/voluntario.dto';
import {
  mapVoluntarioResponse,
  voluntarioSelect,
} from '../utils/voluntario-select.util';

@Injectable()
export class ListarVoluntariosUseCase implements UseCase<
  ListarVoluntariosQueryDto,
  VoluntarioResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarVoluntariosQueryDto,
  ): Promise<VoluntarioResponseDto[]> {
    const activo = query.activo === undefined ? true : query.activo === 'true';

    const where: Prisma.VoluntarioWhereInput = { activo };

    const busqueda = query.busqueda?.trim();
    if (busqueda) {
      where.OR = [
        { nombres: { contains: busqueda, mode: 'insensitive' } },
        { apellidos: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    const voluntarios = await this.prisma.voluntario.findMany({
      where,
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      select: voluntarioSelect,
    });

    return voluntarios.map(mapVoluntarioResponse);
  }
}
