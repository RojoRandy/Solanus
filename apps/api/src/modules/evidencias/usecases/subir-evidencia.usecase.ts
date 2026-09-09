import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { resolverPeriodoMensual } from '@/common/utils/periodo.util';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '@/common/storage/storage.service.interface';
import { extensionFromMimeType } from '@/common/uploads/image-upload.interceptor';
import { EvidenciaResponseDto } from '../dto/evidencia.dto';
import { EVIDENCIA_SELECT, mapEvidencia } from './evidencia.mapper';

export interface SubirEvidenciaArgs {
  anio?: number;
  mes?: number;
  file: Express.Multer.File;
  subidoPorId: number;
}

@Injectable()
export class SubirEvidenciaUseCase implements UseCase<
  SubirEvidenciaArgs,
  EvidenciaResponseDto
> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute({ anio, mes, file, subidoPorId }: SubirEvidenciaArgs): Promise<EvidenciaResponseDto> {
    const periodo = resolverPeriodoMensual(anio, mes);
    const extension = extensionFromMimeType(file.mimetype);
    const carpeta = `evidencias/${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`;
    // Nombre único por timestamp: a diferencia de la foto de un comensal, aquí hay N
    // archivos por carpeta, no uno.
    const rutaArchivo = await this.storage.save(carpeta, `${Date.now()}.${extension}`, file.buffer);

    const evidencia = await this.prisma.evidenciaMensual.create({
      data: { anio: periodo.anio, mes: periodo.mes, rutaArchivo, subidoPorId },
      select: EVIDENCIA_SELECT,
    });

    return mapEvidencia(evidencia);
  }
}
