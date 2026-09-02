import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { ComensalErrors } from '@/common/errors/comensal.errors';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '@/common/storage/storage.service.interface';
import { extensionFromMimeType } from '@/common/uploads/image-upload.interceptor';
import { ComensalDetalleResponseDto } from '../dto/comensal.dto';
import {
  comensalDetalleSelect,
  mapComensalDetalleResponse,
} from '../utils/comensal-select.util';

export interface SubirFotoComensalArgs {
  id: number;
  file: Express.Multer.File;
}

@Injectable()
export class SubirFotoComensalUseCase implements UseCase<
  SubirFotoComensalArgs,
  ComensalDetalleResponseDto
> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute({
    id,
    file,
  }: SubirFotoComensalArgs): Promise<ComensalDetalleResponseDto> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });

    const extension = extensionFromMimeType(file.mimetype);
    const fotoPath = await this.storage.save(
      `comensales/${comensal.folio}`,
      `foto.${extension}`,
      file.buffer,
    );

    const actualizado = await this.prisma.comensal.update({
      where: { id },
      data: { fotoPath },
      select: comensalDetalleSelect,
    });

    return mapComensalDetalleResponse(actualizado);
  }
}
