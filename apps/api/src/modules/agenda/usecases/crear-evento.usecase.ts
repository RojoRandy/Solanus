import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CrearEventoAgendaDto,
  EventoAgendaResponseDto,
} from '../dto/evento-agenda.dto';
import {
  eventoAgendaSelect,
  mapEventoAgendaResponse,
} from '../utils/evento-agenda-select.util';

@Injectable()
export class CrearEventoUseCase implements UseCase<
  CrearEventoAgendaDto,
  EventoAgendaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearEventoAgendaDto): Promise<EventoAgendaResponseDto> {
    const evento = await this.prisma.eventoAgenda.create({
      data: {
        fechaHora: dto.fechaHora,
        descripcion: dto.descripcion,
        color: dto.color,
      },
      select: eventoAgendaSelect,
    });

    return mapEventoAgendaResponse(evento);
  }
}
