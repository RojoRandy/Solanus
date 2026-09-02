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
import { esMayorDeEdad } from '../utils/edad.util';
import {
  comensalDetalleSelect,
  mapComensalDetalleResponse,
} from '../utils/comensal-select.util';

export interface SubirIneFrenteComensalArgs {
  id: number;
  file: Express.Multer.File;
}

/** El INE (frente y reverso) solo aplica a comensales mayores de edad. */
@Injectable()
export class SubirIneFrenteComensalUseCase implements UseCase<
  SubirIneFrenteComensalArgs,
  ComensalDetalleResponseDto
> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute({
    id,
    file,
  }: SubirIneFrenteComensalArgs): Promise<ComensalDetalleResponseDto> {
    const comensal = await this.prisma.comensal.findUnique({ where: { id } });
    if (!comensal) throw ComensalErrors.Exceptions.COMENSAL_NOT_FOUND({ id });
    if (!esMayorDeEdad(comensal.fechaNacimiento)) {
      throw ComensalErrors.Exceptions.INE_SOLO_PARA_MAYORES_DE_EDAD({ id });
    }

    const extension = extensionFromMimeType(file.mimetype);
    const ineFrontPath = await this.storage.save(
      `comensales/${comensal.folio}`,
      `ine-frente.${extension}`,
      file.buffer,
    );

    const actualizado = await this.prisma.comensal.update({
      where: { id },
      data: { ineFrontPath },
      select: comensalDetalleSelect,
    });

    return mapComensalDetalleResponse(actualizado);
  }
}
