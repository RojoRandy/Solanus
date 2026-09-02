import { UseCase } from '@/common/interfaces/use-case.interface';
import { SignInDto, SignInResponseDto } from '../dto/sign-in.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from '../auth.service';
import * as bcrypt from 'bcrypt';
import { AuthErrors } from '@/common/errors/auth.errors';

@Injectable()
export class SignInUseCase implements UseCase<SignInDto, SignInResponseDto> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async execute(signInDto: SignInDto): Promise<SignInResponseDto> {
    const { username, password } = signInDto;

    const user = await this.prisma.usuario.findFirst({
      where: { username, activo: true },
    });

    if (!user) throw AuthErrors.Exceptions.USER_NOT_FOUND({ username });

    if (!(await bcrypt.compare(password, user.password))) {
      throw AuthErrors.Exceptions.INCORRECT_PASSWORD({ username });
    }

    return this.authService.buildSignInResponseDto({
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
    });
  }
}
