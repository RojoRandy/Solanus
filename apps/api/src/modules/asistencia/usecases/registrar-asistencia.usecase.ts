import { Injectable } from '@nestjs/common';
import { MetodoCaptura, Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { AsistenciaResponseDto } from '../dto/turno.dto';

export interface RegistrarAsistenciaArgs {
  turnoId: number;
  comensalId: number;
  metodoCaptura?: MetodoCaptura;
  registradoPorId: number;
}

/**
 * Registra la asistencia de un comensal a un turno — el equivalente digital de
 * anotar el folio en la hoja de papel. El índice único [comensalId, turnoId]
 * evita el doble conteo dentro del mismo turno; se traduce aquí a un error
 * legible en vez de dejar que el cliente vea un P2002 crudo de Prisma.
 */
@Injectable()
export class RegistrarAsistenciaUseCase implements UseCase<
  RegistrarAsistenciaArgs,
  AsistenciaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    turnoId,
    comensalId,
    metodoCaptura,
    registradoPorId,
  }: RegistrarAsistenciaArgs): Promise<AsistenciaResponseDto> {
    const turno = await this.prisma.turnoComida.findUnique({
      where: { id: turnoId },
    });
    if (!turno) throw AsistenciaErrors.Exceptions.TURNO_NOT_FOUND({ turnoId });

    const comensal = await this.prisma.comensal.findUnique({
      where: { id: comensalId },
    });
    if (!comensal)
      throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ comensalId });
    if (!comensal.activo)
      throw AsistenciaErrors.Exceptions.COMENSAL_INACTIVO({ comensalId });

    try {
      const asistencia = await this.prisma.asistencia.create({
        data: {
          turnoId,
          comensalId,
          metodoCaptura: metodoCaptura ?? MetodoCaptura.FOLIO,
          registradoPorId,
        },
        select: {
          id: true,
          metodoCaptura: true,
          createdAt: true,
          comensal: {
            select: {
              id: true,
              folio: true,
              nombres: true,
              apellidos: true,
              fotoPath: true,
            },
          },
        },
      });
      return asistencia;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw AsistenciaErrors.Exceptions.ASISTENCIA_YA_REGISTRADA({
          turnoId,
          comensalId,
        });
      }
      throw error;
    }
  }
}
