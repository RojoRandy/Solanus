import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthErrors } from '@/common/errors/auth.errors';
import { CrearUsuarioDto, UsuarioResponseDto } from '../dto/usuario.dto';

@Injectable()
export class CrearUsuarioUseCase implements UseCase<
  CrearUsuarioDto,
  UsuarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearUsuarioDto): Promise<UsuarioResponseDto> {
    const existente = await this.prisma.usuario.findUnique({
      where: { username: dto.username },
    });
    if (existente)
      throw AuthErrors.Exceptions.USER_ALREADY_EXISTS({
        username: dto.username,
      });

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(dto.password, salt);

    return this.prisma.usuario.create({
      data: {
        username: dto.username,
        nombre: dto.nombre,
        password,
        rol: dto.rol,
      },
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
