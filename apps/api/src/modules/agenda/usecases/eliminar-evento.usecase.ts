import { Injectable } from '@nestjs/common';
import { esEventoPasado } from '@/common/utils/agenda';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AgendaErrors } from '@/common/errors/agenda.errors';

/** Baja lógica: los eventos pasados nunca se editan ni se dan de baja (ver esEventoPasado). */
@Injectable()
export class EliminarEventoUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const evento = await this.prisma.eventoAgenda.findUnique({
      where: { id },
    });
    if (!evento) throw AgendaErrors.Exceptions.EVENTO_NOT_FOUND({ id });
    if (esEventoPasado(evento.fechaHora)) {
      throw AgendaErrors.Exceptions.EVENTO_PASADO_NO_EDITABLE({ id });
    }

    await this.prisma.eventoAgenda.update({
      where: { id },
      data: { activo: false },
    });
  }
}
