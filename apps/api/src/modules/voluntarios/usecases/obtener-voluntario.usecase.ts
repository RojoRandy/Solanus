import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { VoluntarioErrors } from '@/common/errors/voluntario.errors';
import { VoluntarioResponseDto } from '../dto/voluntario.dto';
import {
  mapVoluntarioResponse,
  voluntarioSelect,
} from '../utils/voluntario-select.util';

@Injectable()
export class ObtenerVoluntarioUseCase implements UseCase<
  number,
  VoluntarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<VoluntarioResponseDto> {
    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id },
      select: voluntarioSelect,
    });
    if (!voluntario)
      throw VoluntarioErrors.Exceptions.VOLUNTARIO_NOT_FOUND({ id });

    return mapVoluntarioResponse(voluntario);
  }
}
