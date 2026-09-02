import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { AuthenticatedUser } from '../dto/sign-in.dto';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // @Auth(...) puede aplicarse a nivel de método o de controlador completo (como en
    // UsuariosController): hay que revisar ambos niveles, priorizando el del método.
    const validRoles = this.reflector.getAllAndOverride<string[] | undefined>(
      META_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = req.user;

    if (!user) throw new BadRequestException('User not found');

    if (validRoles.includes(user.rol)) {
      return true;
    }

    throw new ForbiddenException(
      `El usuario ${user.username} necesita alguno de estos roles: [${validRoles.join(', ')}]`,
    );
  }
}
