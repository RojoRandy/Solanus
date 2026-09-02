import {
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import { RoleProtected } from '../decorators/role-protected.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { AuthenticatedUser } from '../dto/sign-in.dto';

// Controlador de prueba con roles declarados en distintos niveles, tal como
// se usan en la app real: @Auth() a nivel de método (AuthController) y a
// nivel de controlador completo (UsuariosController).
class SinRolesController {
  metodoSinProteger() {}
}

@RoleProtected(UserRoles.ADMINISTRADOR)
class ControladorProtegidoPorClase {
  cualquierMetodo() {}
}

class ControladorConMetodoProtegido {
  @RoleProtected(UserRoles.USUARIO_SIMPLE, UserRoles.ADMINISTRADOR)
  metodoProtegido() {}
}

function mkUser(
  overrides: Partial<AuthenticatedUser> & Pick<AuthenticatedUser, 'rol'>,
): AuthenticatedUser {
  return {
    id: 1,
    username: 'test-user',
    nombre: 'Usuario de Prueba',
    ...overrides,
  };
}

function buildContext<T extends object>(
  target: T,
  handlerName: keyof T,
  user?: AuthenticatedUser,
): ExecutionContext {
  const handler = target[handlerName];
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => handler,
    getClass: () => target.constructor,
  } as unknown as ExecutionContext;
}

describe('UserRoleGuard', () => {
  let reflector: Reflector;
  let guard: UserRoleGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);
  });

  it('permite el acceso cuando ningún nivel declara roles', () => {
    const target = new SinRolesController();
    const ctx = buildContext(
      target,
      'metodoSinProteger',
      mkUser({ rol: UserRoles.USUARIO_SIMPLE }),
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rechaza cuando no hay usuario autenticado en la petición', () => {
    const target = new ControladorConMetodoProtegido();
    const ctx = buildContext(target, 'metodoProtegido', undefined);
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });

  it('permite el acceso cuando el rol coincide con la metadata a nivel de método', () => {
    const target = new ControladorConMetodoProtegido();
    const ctx = buildContext(
      target,
      'metodoProtegido',
      mkUser({ username: 'captura', rol: UserRoles.USUARIO_SIMPLE }),
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rechaza cuando el rol no está en la metadata a nivel de método', () => {
    const target = new ControladorConMetodoProtegido();
    const ctx = buildContext(
      target,
      'metodoProtegido',
      mkUser({ username: 'operativo', rol: UserRoles.USUARIO }),
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  // Regresión: @Auth() aplicado a nivel de controlador (como en UsuariosController)
  // debe proteger TODOS sus métodos, no solo los que además lo declaren ellos mismos.
  it('rechaza cuando el rol no está en la metadata a nivel de controlador', () => {
    const target = new ControladorProtegidoPorClase();
    const ctx = buildContext(
      target,
      'cualquierMetodo',
      mkUser({ username: 'captura', rol: UserRoles.USUARIO_SIMPLE }),
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('permite el acceso cuando el rol coincide con la metadata a nivel de controlador', () => {
    const target = new ControladorProtegidoPorClase();
    const ctx = buildContext(
      target,
      'cualquierMetodo',
      mkUser({ username: 'admin', rol: UserRoles.ADMINISTRADOR }),
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
