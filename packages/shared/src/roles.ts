/**
 * Roles del sistema. Debe coincidir exactamente con el enum RolUsuario de
 * apps/api/prisma/schema.prisma — es la fuente de verdad en el backend;
 * este archivo es la copia de referencia para el frontend.
 */
export const UserRoles = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  USUARIO: 'USUARIO',
  USUARIO_SIMPLE: 'USUARIO_SIMPLE',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
