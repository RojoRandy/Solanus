import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { CrearComensalDto, ComensalResponseDto } from '../dto/comensal.dto';
import { calcularEdad } from '../utils/edad.util';
import { validarTutorAsignado } from '../utils/validar-tutor.util';
import {
  comensalListSelect,
  mapComensalResponse,
} from '../utils/comensal-select.util';

@Injectable()
export class CrearComensalUseCase implements UseCase<
  CrearComensalDto,
  ComensalResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearComensalDto): Promise<ComensalResponseDto> {
    const edad = calcularEdad(dto.fechaNacimiento);
    await validarTutorAsignado(this.prisma, {
      edadComensal: edad,
      tutorId: dto.tutorId ?? null,
    });

    const comensal = await this.prisma.comensal.create({
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        fechaNacimiento: dto.fechaNacimiento,
        curp: dto.curp,
        tutorId: dto.tutorId ?? null,
      },
      select: comensalListSelect,
    });

    return mapComensalResponse(comensal);
  }
}
