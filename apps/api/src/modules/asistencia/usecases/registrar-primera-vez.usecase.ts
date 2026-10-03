import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';
import { PrimeraVezResponseDto } from '../dto/turno.dto';

export interface RegistrarPrimeraVezArgs {
  turnoId: number;
  nombre: string;
  registradoPorId: number;
}

/**
 * Registra a alguien que llega por primera vez sin darlo de alta como comensal:
 * solo se anota su nombre. Se cuenta aparte de las asistencias de comensales.
 */
@Injectable()
export class RegistrarPrimeraVezUseCase implements UseCase<
  RegistrarPrimeraVezArgs,
  PrimeraVezResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    turnoId,
    nombre,
    registradoPorId,
  }: RegistrarPrimeraVezArgs): Promise<PrimeraVezResponseDto> {
    const turno = await this.prisma.turnoComida.findUnique({
      where: { id: turnoId },
    });
    if (!turno) throw AsistenciaErrors.Exceptions.TURNO_NOT_FOUND({ turnoId });

    return this.prisma.asistenciaPrimeraVez.create({
      data: { turnoId, nombre: nombre.trim(), registradoPorId },
      select: { id: true, nombre: true, createdAt: true },
    });
  }
}
