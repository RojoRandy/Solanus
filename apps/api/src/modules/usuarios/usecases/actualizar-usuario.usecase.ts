import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthErrors } from '@/common/errors/auth.errors';
import { ActualizarUsuarioDto, UsuarioResponseDto } from '../dto/usuario.dto';

export interface ActualizarUsuarioArgs {
  id: number;
  dto: ActualizarUsuarioDto;
}

@Injectable()
export class ActualizarUsuarioUseCase implements UseCase<
  ActualizarUsuarioArgs,
  UsuarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    id,
    dto,
  }: ActualizarUsuarioArgs): Promise<UsuarioResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw AuthErrors.Exceptions.USER_NOT_FOUND({ id });

    const password = dto.password
      ? await bcrypt.hash(dto.password, await bcrypt.genSalt(10))
      : undefined;

    return this.prisma.usuario.update({
      where: { id },
      data: { nombre: dto.nombre, rol: dto.rol, activo: dto.activo, password },
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });
  }
}
