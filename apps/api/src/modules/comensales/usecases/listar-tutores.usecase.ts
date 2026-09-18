import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { TutorResponseDto } from '../dto/comensal.dto';
import { corteMayoriaEdad } from '../utils/edad.util';

@Injectable()
export class ListarTutoresUseCase implements UseCase<void, TutorResponseDto[]> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<TutorResponseDto[]> {
    return this.prisma.comensal.findMany({
      where: {
        activo: true,
        tutorId: null,
        fechaNacimiento: { lte: corteMayoriaEdad() },
      },
      select: { id: true, folio: true, nombres: true, apellidos: true },
      orderBy: { folio: 'asc' },
    });
  }
}
