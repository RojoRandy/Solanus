import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthErrors } from '@/common/errors/auth.errors';
import { AuthenticatedUser } from '../dto/sign-in.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: AuthenticatedUser): Promise<AuthenticatedUser> {
    const { username } = payload;
    const user = await this.prisma.usuario.findFirst({
      where: { username, activo: true },
    });
    if (!user) throw AuthErrors.Exceptions.USER_NOT_FOUND({ username });

    return {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
    };
  }
}
