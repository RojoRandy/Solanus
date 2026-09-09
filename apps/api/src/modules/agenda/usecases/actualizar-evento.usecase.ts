import { Injectable } from '@nestjs/common';
import { esEventoPasado } from '@/common/utils/agenda';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AgendaErrors } from '@/common/errors/agenda.errors';
import {
  ActualizarEventoAgendaDto,
  EventoAgendaResponseDto,
} from '../dto/evento-agenda.dto';
import {
  eventoAgendaSelect,
  mapEventoAgendaResponse,
} from '../utils/evento-agenda-select.util';

export interface ActualizarEventoArgs {
  id: number;
  dto: ActualizarEventoAgendaDto;
}

@Injectable()
export class ActualizarEventoUseCase implements UseCase<
  ActualizarEventoArgs,
  EventoAgendaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarEventoArgs): Promise<EventoAgendaResponseDto> {
    const evento = await this.prisma.eventoAgenda.findUnique({
      where: { id },
    });
    if (!evento) throw AgendaErrors.Exceptions.EVENTO_NOT_FOUND({ id });
    if (esEventoPasado(evento.fechaHora)) {
      throw AgendaErrors.Exceptions.EVENTO_PASADO_NO_EDITABLE({ id });
    }

    const actualizado = await this.prisma.eventoAgenda.update({
      where: { id },
      data: {
        fechaHora: dto.fechaHora,
        descripcion: dto.descripcion,
        color: dto.color,
        activo: dto.activo,
      },
      select: eventoAgendaSelect,
    });

    return mapEventoAgendaResponse(actualizado);
  }
}
