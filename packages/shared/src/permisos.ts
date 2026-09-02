import { UserRoles, type UserRole } from './roles';

/**
 * Matriz de permisos por módulo × rol (ver sección "Matriz de permisos" del plan).
 * El frontend la usa para filtrar el menú de navegación; el backend es quien
 * hace cumplir el permiso real vía @Auth(...roles) en cada endpoint — esta
 * matriz nunca sustituye esa verificación, solo evita mostrar en el menú
 * módulos a los que el rol no tiene acceso (requisito de UI, sección 6 del brief).
 */
export type Modulo =
  | 'usuarios'
  | 'comensales'
  | 'asistencia'
  | 'inventario'
  | 'bienhechores'
  | 'voluntarios'
  | 'dashboard'
  | 'reportes';

const TODOS_LOS_ROLES: UserRole[] = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO, UserRoles.USUARIO_SIMPLE];

export const MODULOS_POR_ROL: Record<Modulo, UserRole[]> = {
  usuarios: [UserRoles.ADMINISTRADOR],
  comensales: TODOS_LOS_ROLES,
  asistencia: TODOS_LOS_ROLES,
  inventario: [UserRoles.ADMINISTRADOR, UserRoles.USUARIO],
  bienhechores: [UserRoles.ADMINISTRADOR, UserRoles.USUARIO],
  voluntarios: [UserRoles.ADMINISTRADOR, UserRoles.USUARIO],
  dashboard: [UserRoles.ADMINISTRADOR, UserRoles.USUARIO],
  reportes: [UserRoles.ADMINISTRADOR, UserRoles.USUARIO],
};

export function puedeAcceder(rol: UserRole, modulo: Modulo): boolean {
  return MODULOS_POR_ROL[modulo].includes(rol);
}
