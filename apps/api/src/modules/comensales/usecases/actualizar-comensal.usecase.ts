import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import {
  ActualizarComensalDto,
  ComensalResponseDto,
} from '../dto/comensal.dto';
import { calcularEdad } from '../utils/edad.util';
import { validarTutorAsignado } from '../utils/validar-tutor.util';
import {
  comensalListSelect,
  mapComensalResponse,
} from '../utils/comensal-select.util';

export interface ActualizarComensalArgs {
  id: number;
  dto: ActualizarComensalDto;
}

@Injectable()
export class ActualizarComensalUseCase implements UseCase<
  ActualizarComensalArgs,
  ComensalResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarComensalArgs): Promise<ComensalResponseDto> {
    const existente = await this.prisma.comensal.findUnique({ where: { id } });
    if (!existente) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    const fechaNacimiento = dto.fechaNacimiento ?? existente.fechaNacimiento;
    const tutorId = dto.tutorId !== undefined ? dto.tutorId : existente.tutorId;
    const edad = calcularEdad(fechaNacimiento);

    await validarTutorAsignado(this.prisma, {
      comensalId: id,
      edadComensal: edad,
      tutorId,
    });

    const comensal = await this.prisma.comensal.update({
      where: { id },
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        fechaNacimiento: dto.fechaNacimiento,
        curp: dto.curp,
        tutorId: dto.tutorId !== undefined ? dto.tutorId : undefined,
      },
      select: comensalListSelect,
    });

    return mapComensalResponse(comensal);
  }
}
