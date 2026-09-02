import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CrearVoluntarioDto,
  VoluntarioResponseDto,
} from '../dto/voluntario.dto';
import {
  mapVoluntarioResponse,
  voluntarioSelect,
} from '../utils/voluntario-select.util';

@Injectable()
export class CrearVoluntarioUseCase implements UseCase<
  CrearVoluntarioDto,
  VoluntarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearVoluntarioDto): Promise<VoluntarioResponseDto> {
    const voluntario = await this.prisma.voluntario.create({
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        telefono: dto.telefono,
      },
      select: voluntarioSelect,
    });

    return mapVoluntarioResponse(voluntario);
  }
}
