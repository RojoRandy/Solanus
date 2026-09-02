import type { UserRole } from './roles';

export interface AuthenticatedUser {
  id: number;
  username: string;
  nombre: string;
  rol: UserRole;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse {
  user: AuthenticatedUser;
  token: string;
}
