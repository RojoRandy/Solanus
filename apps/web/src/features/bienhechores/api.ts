import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ActualizarBienhechorInput, Bienhechor, CrearBienhechorInput } from './types';

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function useBienhechores(params?: { buscar?: string; incluirInactivos?: boolean }) {
  return useQuery({
    queryKey: ['bienhechores', params],
    queryFn: () => api.get<Bienhechor[]>(`/bienhechores${buildQuery(params ?? {})}`),
  });
}

export function useBienhechor(id: number | undefined) {
  return useQuery({
    queryKey: ['bienhechores', id],
    queryFn: () => api.get<Bienhechor>(`/bienhechores/${id}`),
    enabled: id !== undefined,
  });
}

export function useCrearBienhechor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearBienhechorInput) => api.post<Bienhechor>('/bienhechores', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bienhechores'] });
    },
  });
}

export function useActualizarBienhechor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarBienhechorInput }) =>
      api.patch<Bienhechor>(`/bienhechores/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bienhechores'] });
    },
  });
}

export function useEliminarBienhechor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/bienhechores/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bienhechores'] });
    },
  });
}
