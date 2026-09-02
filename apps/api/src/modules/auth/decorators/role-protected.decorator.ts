import { UserRoles } from '@/common/interfaces/enums';
import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';
export const RoleProtected = (...roles: UserRoles[]) =>
  SetMetadata(META_ROLES, roles);
