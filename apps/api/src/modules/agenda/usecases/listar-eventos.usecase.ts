import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  EventoAgendaResponseDto,
  ListarEventosAgendaQueryDto,
} from '../dto/evento-agenda.dto';
import {
  eventoAgendaSelect,
  mapEventoAgendaResponse,
} from '../utils/evento-agenda-select.util';

@Injectable()
export class ListarEventosUseCase implements UseCase<
  ListarEventosAgendaQueryDto,
  EventoAgendaResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListarEventosAgendaQueryDto,
  ): Promise<EventoAgendaResponseDto[]> {
    const activo = query.activo === undefined ? true : query.activo === 'true';
    const filtro = query.filtro ?? 'proximos';
    const hoy = new Date();
    const inicioDeHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const where: Prisma.EventoAgendaWhereInput = {
      activo,
      fechaHora: filtro === 'pasados' ? { lt: inicioDeHoy } : { gte: inicioDeHoy },
    };

    const eventos = await this.prisma.eventoAgenda.findMany({
      where,
      orderBy: { fechaHora: filtro === 'pasados' ? 'desc' : 'asc' },
      select: eventoAgendaSelect,
    });

    return eventos.map(mapEventoAgendaResponse);
  }
}
