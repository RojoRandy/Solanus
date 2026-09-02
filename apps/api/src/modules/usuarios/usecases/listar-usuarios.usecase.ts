import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { UsuarioResponseDto } from '../dto/usuario.dto';

@Injectable()
export class ListarUsuariosUseCase implements UseCase<
  void,
  UsuarioResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<UsuarioResponseDto[]> {
    return this.prisma.usuario.findMany({
      orderBy: { nombre: 'asc' },
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
