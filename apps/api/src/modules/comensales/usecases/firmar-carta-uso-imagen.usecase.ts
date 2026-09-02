import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import { now } from '@/common/utils/date';
import {
  ComensalDetalleResponseDto,
  FirmarCartaUsoImagenDto,
} from '../dto/comensal.dto';
import { esMayorDeEdad } from '../utils/edad.util';
import {
  comensalDetalleSelect,
  mapComensalDetalleResponse,
} from '../utils/comensal-select.util';

export interface FirmarCartaUsoImagenArgs {
  id: number;
  dto: FirmarCartaUsoImagenDto;
}

/**
 * El firmante se calcula en el backend, nunca se recibe del cliente: es el propio
 * comensal si es mayor de edad, o su tutor si es menor (ver brief del módulo).
 */
@Injectable()
export class FirmarCartaUsoImagenUseCase implements UseCase<
  FirmarCartaUsoImagenArgs,
  ComensalDetalleResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: FirmarCartaUsoImagenArgs): Promise<ComensalDetalleResponseDto> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    let firmanteId: number;
    if (esMayorDeEdad(comensal.fechaNacimiento)) {
      firmanteId = comensal.id;
    } else {
      if (!comensal.tutorId) {
        throw ComensalErrors.Exceptions.TUTOR_REQUERIDO_PARA_MENOR({ id });
      }
      firmanteId = comensal.tutorId;
    }

    const fechaFirma = now().toDate();

    await this.prisma.cartaUsoImagen.upsert({
      where: { comensalId: id },
      create: {
        comensalId: id,
        firmanteId,
        autoriza: dto.autoriza,
        fechaFirma,
      },
      update: {
        firmanteId,
        autoriza: dto.autoriza,
        fechaFirma,
      },
    });

    const actualizado = await this.prisma.comensal.findUniqueOrThrow({
      where: { id },
      select: comensalDetalleSelect,
    });

    return mapComensalDetalleResponse(actualizado);
  }
}
