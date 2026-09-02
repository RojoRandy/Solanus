export interface Bienhechor {
  id: number;
  nombre: string;
  contacto: string | null;
  rfc: string | null;
  activo: boolean;
  createdAt: string;
}

export interface CrearBienhechorInput {
  nombre: string;
  contacto?: string;
  rfc?: string;
}

export type ActualizarBienhechorInput = Partial<CrearBienhechorInput> & {
  activo?: boolean;
};
