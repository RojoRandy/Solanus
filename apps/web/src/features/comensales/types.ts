/**
 * Tipos del módulo Comensales — reflejan los DTOs de respuesta del backend
 * (apps/api/src/modules/comensales/dto/comensal.dto.ts). Se mantienen aquí,
 * en el propio feature, porque no forman parte de packages/shared.
 */
export interface Tutor {
  id: number;
  folio: number;
  nombres: string;
  apellidos: string;
}

export interface ComensalTutorResumen {
  id: number;
  folio: number;
  nombres: string;
  apellidos: string;
}

export interface CartaUsoImagen {
  id: number;
  autoriza: boolean;
  fechaFirma: string | null;
  firmanteId: number | null;
}

export interface Comensal {
  id: number;
  folio: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  curp: string | null;
  genero: Genero;
  fotoPath: string | null;
  tutor: ComensalTutorResumen | null;
  activo: boolean;
  createdAt: string;
}

export interface ComensalDetalle extends Comensal {
  ineFrontPath: string | null;
  ineBackPath: string | null;
  menores: ComensalTutorResumen[];
  cartaUsoImagen: CartaUsoImagen | null;
  updatedAt: string;
}

export interface CrearComensalPayload {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  curp?: string;
  genero?: Genero;
  tutorId?: number | null;
}

export type ActualizarComensalPayload = Partial<CrearComensalPayload>;

export type GrupoEdad = 'ninos' | 'adultos' | 'adultos_mayores';

export type Genero = 'HOMBRE' | 'MUJER' | 'SIN_ESPECIFICAR';

export const ETIQUETAS_GENERO: Record<Genero, string> = {
  HOMBRE: 'Hombre',
  MUJER: 'Mujer',
  SIN_ESPECIFICAR: 'Sin especificar',
};

export interface ListarComensalesParams {
  busqueda?: string;
  activo?: 'true' | 'false';
  grupoEdad?: GrupoEdad;
  genero?: Genero;
  page?: number;
  limit?: number;
  ordenarPor?: 'folio' | 'nombre';
  orden?: 'asc' | 'desc';
}

export interface AsistenciaComensal {
  id: number;
  fecha: string;
  horario: 'DESAYUNO' | 'COMIDA' | 'CENA';
  metodoCaptura: string;
  registradoPor: { id: number; nombre: string };
}
