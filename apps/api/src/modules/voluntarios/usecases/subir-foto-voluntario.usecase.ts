import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { VoluntarioErrors } from '@/common/errors/voluntario.errors';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '@/common/storage/storage.service.interface';
import { extensionFromMimeType } from '@/common/uploads/image-upload.interceptor';
import { VoluntarioResponseDto } from '../dto/voluntario.dto';
import {
  mapVoluntarioResponse,
  voluntarioSelect,
} from '../utils/voluntario-select.util';

export interface SubirFotoVoluntarioArgs {
  id: number;
  file?: Express.Multer.File;
}

@Injectable()
export class SubirFotoVoluntarioUseCase implements UseCase<
  SubirFotoVoluntarioArgs,
  VoluntarioResponseDto
> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async execute({
    id,
    file,
  }: SubirFotoVoluntarioArgs): Promise<VoluntarioResponseDto> {
    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id },
    });
    if (!voluntario)
      throw VoluntarioErrors.Exceptions.VOLUNTARIO_NOT_FOUND({ id });
    if (!file) throw VoluntarioErrors.Exceptions.FOTO_REQUERIDA();

    const extension = extensionFromMimeType(file.mimetype);
    const fotoPath = await this.storage.save(
      `voluntarios/${id}`,
      `foto-${Date.now()}.${extension}`,
      file.buffer,
    );

    const actualizado = await this.prisma.voluntario.update({
      where: { id },
      data: { fotoPath },
      select: voluntarioSelect,
    });

    return mapVoluntarioResponse(actualizado);
  }
}
