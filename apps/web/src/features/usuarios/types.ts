export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'USUARIO' | 'USUARIO_SIMPLE';
  activo: boolean;
  createdAt: string;
}

export interface CrearUsuarioInput {
  username: string;
  nombre: string;
  password: string;
  rol: Usuario['rol'];
}

export type ActualizarUsuarioInput = Partial<Omit<CrearUsuarioInput, 'username'>> & {
  activo?: boolean;
};
