import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { VoluntarioErrors } from '@/common/errors/voluntario.errors';
import {
  ActualizarVoluntarioDto,
  VoluntarioResponseDto,
} from '../dto/voluntario.dto';
import {
  mapVoluntarioResponse,
  voluntarioSelect,
} from '../utils/voluntario-select.util';

export interface ActualizarVoluntarioArgs {
  id: number;
  dto: ActualizarVoluntarioDto;
}

@Injectable()
export class ActualizarVoluntarioUseCase implements UseCase<
  ActualizarVoluntarioArgs,
  VoluntarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarVoluntarioArgs): Promise<VoluntarioResponseDto> {
    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id },
    });
    if (!voluntario)
      throw VoluntarioErrors.Exceptions.VOLUNTARIO_NOT_FOUND({ id });

    const actualizado = await this.prisma.voluntario.update({
      where: { id },
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        telefono: dto.telefono,
        activo: dto.activo,
      },
      select: voluntarioSelect,
    });

    return mapVoluntarioResponse(actualizado);
  }
}
