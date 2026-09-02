import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { api, ApiError, getToken } from '@/lib/api-client';
import type {
  ActualizarComensalPayload,
  Comensal,
  ComensalDetalle,
  CrearComensalPayload,
  ListarComensalesParams,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const SERVER_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/** Los archivos (foto, INE) se sirven como estáticos en la raíz del servidor, fuera del prefijo /api. */
export function resolverUrlArchivo(rutaPublica: string): string {
  return `${SERVER_ROOT_URL}${rutaPublica}`;
}

const queryKeys = {
  lista: (params: ListarComensalesParams) => ['comensales', 'lista', params] as const,
  detalle: (id: number) => ['comensales', 'detalle', id] as const,
};

function construirQueryString(params: ListarComensalesParams): string {
  const query = new URLSearchParams();
  if (params.busqueda) query.set('busqueda', params.busqueda);
  if (params.activo) query.set('activo', params.activo);
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

export function useComensales(params: ListarComensalesParams) {
  return useQuery({
    queryKey: queryKeys.lista(params),
    queryFn: () => api.get<Comensal[]>(`/comensales${construirQueryString(params)}`),
  });
}

export function useComensal(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.detalle(id ?? -1),
    queryFn: () => api.get<ComensalDetalle>(`/comensales/${id}`),
    enabled: id !== undefined,
  });
}

export function useCrearComensal(): UseMutationResult<Comensal, ApiError, CrearComensalPayload> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearComensalPayload) => api.post<Comensal>('/comensales', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comensales', 'lista'] });
    },
  });
}

export function useActualizarComensal(
  id: number,
): UseMutationResult<Comensal, ApiError, ActualizarComensalPayload> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarComensalPayload) =>
      api.patch<Comensal>(`/comensales/${id}`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comensales', 'lista'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.detalle(id) });
    },
  });
}

export function useEliminarComensal(): UseMutationResult<void, ApiError, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/comensales/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comensales', 'lista'] });
    },
  });
}

export function useFirmarCartaUsoImagen(
  id: number,
): UseMutationResult<ComensalDetalle, ApiError, { autoriza: boolean }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { autoriza: boolean }) =>
      api.post<ComensalDetalle>(`/comensales/${id}/carta-uso-imagen`, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detalle(id), data);
      void queryClient.invalidateQueries({ queryKey: ['comensales', 'lista'] });
    },
  });
}

/**
 * Sube un archivo (foto o INE). No usa `api-client` porque ese cliente siempre
 * fuerza `Content-Type: application/json`, lo cual rompe multipart/form-data.
 */
async function subirArchivo(
  path: string,
  fieldName: string,
  file: File,
): Promise<ComensalDetalle> {
  const token = getToken();
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    const error = body as { code?: string; description?: string; data?: unknown };
    throw new ApiError(
      response.status,
      error.code ?? 'UNKNOWN_ERROR',
      error.description ?? 'Ocurrió un error inesperado',
      error.data,
    );
  }

  return (body as { data: ComensalDetalle }).data;
}

function useSubirArchivoComensal(id: number, path: string, fieldName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => subirArchivo(`/comensales/${id}${path}`, fieldName, file),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detalle(id), data);
      void queryClient.invalidateQueries({ queryKey: ['comensales', 'lista'] });
    },
  });
}

export function useSubirFotoComensal(id: number) {
  return useSubirArchivoComensal(id, '/foto', 'foto');
}

export function useSubirIneFrenteComensal(id: number) {
  return useSubirArchivoComensal(id, '/ine-frente', 'ine');
}

export function useSubirIneReversoComensal(id: number) {
  return useSubirArchivoComensal(id, '/ine-reverso', 'ine');
}

/** Descarga el PDF del expediente adjuntando el token, ya que es una petición binaria fuera de `api-client`. */
export async function descargarExpedientePdf(id: number, folio: number): Promise<void> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/comensales/${id}/expediente.pdf`, {
    headers,
  });

  if (!response.ok) {
    let description = 'No se pudo descargar el expediente';
    try {
      const body = (await response.json()) as { description?: string };
      description = body.description ?? description;
    } catch {
      // El cuerpo no era JSON; se mantiene el mensaje genérico.
    }
    throw new ApiError(response.status, 'ERROR_DESCARGA_EXPEDIENTE', description);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expediente-${folio}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
