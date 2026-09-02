import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BienhechorResponseDto,
  ListarBienhechoresQueryDto,
} from '../dto/bienhechor.dto';

@Injectable()
export class ListarBienhechoresUseCase implements UseCase<
  ListarBienhechoresQueryDto,
  BienhechorResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarBienhechoresQueryDto = {},
  ): Promise<BienhechorResponseDto[]> {
    const where: Prisma.BienhechorWhereInput = {
      activo: query.incluirInactivos ? undefined : true,
      nombre: query.buscar
        ? { contains: query.buscar, mode: 'insensitive' }
        : undefined,
    };

    return this.prisma.bienhechor.findMany({
      where,
      orderBy: { nombre: 'asc' },
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
