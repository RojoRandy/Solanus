/**
 * Acceso a datos del módulo Voluntarios.
 */
import { api, resolverUrlArchivo } from '@/lib/api-client';

export interface Voluntario {
  id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  fotoPath: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearVoluntarioInput {
  nombres: string;
  apellidos: string;
  telefono: string;
}

export interface ActualizarVoluntarioInput {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  activo?: boolean;
}

export interface ListarVoluntariosParams {
  busqueda?: string;
  activo?: 'true' | 'false';
}

/** Convierte la ruta pública que regresa el backend (p. ej. "/uploads/voluntarios/3/foto.jpg")
 * en una URL absoluta que el navegador pueda cargar. */
export function resolveFotoUrl(fotoPath: string | null | undefined): string | undefined {
  if (!fotoPath) return undefined;
  if (/^https?:\/\//.test(fotoPath)) return fotoPath;
  return resolverUrlArchivo(fotoPath);
}

function buildQueryString(params: ListarVoluntariosParams): string {
  const search = new URLSearchParams();
  if (params.busqueda) search.set('busqueda', params.busqueda);
  if (params.activo) search.set('activo', params.activo);
  const query = search.toString();
  return query ? `?${query}` : '';
}

function subirFoto(id: number, file: File): Promise<Voluntario> {
  const formData = new FormData();
  formData.append('foto', file);
  return api.upload<Voluntario>(`/voluntarios/${id}/foto`, formData);
}

export const voluntariosApi = {
  listar: (params: ListarVoluntariosParams = {}) => api.get<Voluntario[]>(`/voluntarios${buildQueryString(params)}`),
  obtener: (id: number) => api.get<Voluntario>(`/voluntarios/${id}`),
  crear: (input: CrearVoluntarioInput) => api.post<Voluntario>('/voluntarios', input),
  actualizar: (id: number, input: ActualizarVoluntarioInput) => api.patch<Voluntario>(`/voluntarios/${id}`, input),
  eliminar: (id: number) => api.delete<void>(`/voluntarios/${id}`),
  subirFoto,
};
