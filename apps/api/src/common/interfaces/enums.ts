// Fuente única de verdad: el enum vive en prisma/schema.prisma (RolUsuario) y aquí
// solo se reexporta bajo el nombre que usa el resto del backend (DTOs, guards, decoradores).
export { RolUsuario as UserRoles } from '@prisma/client';
