import { Prisma } from '@prisma/client';
import { EventoAgendaResponseDto } from '../dto/evento-agenda.dto';

export const eventoAgendaSelect = {
  id: true,
  fechaHora: true,
  descripcion: true,
  color: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventoAgendaSelect;

type EventoAgendaConSelect = Prisma.EventoAgendaGetPayload<{
  select: typeof eventoAgendaSelect;
}>;

export function mapEventoAgendaResponse(
  evento: EventoAgendaConSelect,
): EventoAgendaResponseDto {
  return { ...evento };
}
