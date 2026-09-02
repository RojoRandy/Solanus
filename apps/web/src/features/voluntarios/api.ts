/**
 * Acceso a datos del módulo Voluntarios.
 *
 * La subida de foto necesita multipart/form-data, pero `@/lib/api-client` fuerza
 * siempre `Content-Type: application/json` en sus peticiones — por eso aquí se
 * hace un fetch propio para ese único caso, replicando el mismo contrato de
 * error (`ApiError`) que usa el resto de la app.
 */
import { api, ApiError, getToken } from '@/lib/api-client';

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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
/** Origen del backend sin el prefijo /api — de ahí cuelga /uploads. */
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Convierte la ruta pública que regresa el backend (p. ej. "/uploads/voluntarios/3/foto.jpg")
 * en una URL absoluta que el navegador pueda cargar. */
export function resolveFotoUrl(fotoPath: string | null | undefined): string | undefined {
  if (!fotoPath) return undefined;
  if (/^https?:\/\//.test(fotoPath)) return fotoPath;
  return `${API_ORIGIN}${fotoPath}`;
}

function buildQueryString(params: ListarVoluntariosParams): string {
  const search = new URLSearchParams();
  if (params.busqueda) search.set('busqueda', params.busqueda);
  if (params.activo) search.set('activo', params.activo);
  const query = search.toString();
  return query ? `?${query}` : '';
}

interface ErrorResponseBody {
  code: string;
  description: string;
  data?: unknown;
}

async function subirFoto(id: number, file: File): Promise<Voluntario> {
  const token = getToken();
  const formData = new FormData();
  formData.append('foto', file);

  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}/voluntarios/${id}/foto`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const body = await response.json();

  if (!response.ok) {
    const error = body as ErrorResponseBody;
    throw new ApiError(response.status, error.code ?? 'UNKNOWN_ERROR', error.description ?? 'Ocurrió un error inesperado', error.data);
  }

  return (body as { data: Voluntario }).data;
}

export const voluntariosApi = {
  listar: (params: ListarVoluntariosParams = {}) => api.get<Voluntario[]>(`/voluntarios${buildQueryString(params)}`),
  obtener: (id: number) => api.get<Voluntario>(`/voluntarios/${id}`),
  crear: (input: CrearVoluntarioInput) => api.post<Voluntario>('/voluntarios', input),
  actualizar: (id: number, input: ActualizarVoluntarioInput) => api.patch<Voluntario>(`/voluntarios/${id}`, input),
  eliminar: (id: number) => api.delete<void>(`/voluntarios/${id}`),
  subirFoto,
};
