import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthErrors } from '@/common/errors/auth.errors';

/** Baja lógica: eliminar usuarios del sistema nunca borra el registro (auditoría). */
@Injectable()
export class EliminarUsuarioUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw AuthErrors.Exceptions.USER_NOT_FOUND({ id });

    await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}
