import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BienhechorResponseDto,
  CrearBienhechorDto,
} from '../dto/bienhechor.dto';

const BIENHECHOR_SELECT = {
  id: true,
  nombre: true,
  contacto: true,
  rfc: true,
  activo: true,
  createdAt: true,
};

@Injectable()
export class CrearBienhechorUseCase implements UseCase<
  CrearBienhechorDto,
  BienhechorResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearBienhechorDto): Promise<BienhechorResponseDto> {
    return this.prisma.bienhechor.create({
      data: {
        nombre: dto.nombre,
        contacto: dto.contacto,
        rfc: dto.rfc,
      },
      select: BIENHECHOR_SELECT,
    });
  }
}
