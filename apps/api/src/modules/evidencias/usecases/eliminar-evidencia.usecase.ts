import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { CommonErrors } from '@/common/errors/common.errors';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '@/common/storage/storage.service.interface';

@Injectable()
export class EliminarEvidenciaUseCase implements UseCase<number, void> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute(id: number): Promise<void> {
    const evidencia = await this.prisma.evidenciaMensual.findUnique({ where: { id } });
    if (!evidencia) throw CommonErrors.Exceptions.ARCHIVO_NO_ENCONTRADO({ id });

    // Primero la fila, después el archivo: si el storage falla, a lo sumo queda un
    // archivo huérfano (inofensivo); al revés dejaría una fila apuntando a nada.
    await this.prisma.evidenciaMensual.delete({ where: { id } });
    await this.storage.delete(evidencia.rutaArchivo);
  }
}
