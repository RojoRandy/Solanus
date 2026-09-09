import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { api, type ApiError } from '@/lib/api-client';
import type { Paginated } from '@/lib/pagination';
import type {
  ActualizarComensalPayload,
  AsistenciaComensal,
  Comensal,
  ComensalDetalle,
  CrearComensalPayload,
  ListarComensalesParams,
} from './types';

export { resolverUrlArchivo } from '@/lib/api-client';

const queryKeys = {
  lista: (params: ListarComensalesParams) => ['comensales', 'lista', params] as const,
  detalle: (id: number) => ['comensales', 'detalle', id] as const,
};

function construirQueryString(params: ListarComensalesParams): string {
  const query = new URLSearchParams();
  if (params.busqueda) query.set('busqueda', params.busqueda);
  if (params.activo) query.set('activo', params.activo);
  if (params.grupoEdad) query.set('grupoEdad', params.grupoEdad);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.ordenarPor) query.set('ordenarPor', params.ordenarPor);
  if (params.orden) query.set('orden', params.orden);
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

export function useComensales(params: ListarComensalesParams) {
  return useQuery({
    queryKey: queryKeys.lista(params),
    queryFn: () => api.get<Paginated<Comensal>>(`/comensales${construirQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useAsistenciasComensal(id: number | undefined, params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return useQuery({
    queryKey: ['comensales', 'asistencias', id, params],
    queryFn: () => api.get<Paginated<AsistenciaComensal>>(`/comensales/${id}/asistencias${qs ? `?${qs}` : ''}`),
    enabled: id !== undefined,
    placeholderData: keepPreviousData,
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

function useSubirArchivoComensal(id: number, path: string, fieldName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append(fieldName, file);
      return api.upload<ComensalDetalle>(`/comensales/${id}${path}`, formData);
    },
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

export function descargarExpedientePdf(id: number, folio: number): Promise<void> {
  return api.descargar(`/comensales/${id}/expediente.pdf`, `expediente-${folio}.pdf`);
}

export function descargarComensales(
  formato: 'xlsx' | 'pdf',
  params: ListarComensalesParams,
): Promise<void> {
  // El export no pagina: se omiten page/limit para que el archivo cubra todo lo filtrado.
  const filtros: ListarComensalesParams = { ...params, page: undefined, limit: undefined };
  return api.descargar(
    `/comensales/exportar.${formato}${construirQueryString(filtros)}`,
    `comensales-${new Date().toISOString().slice(0, 10)}.${formato}`,
  );
}
