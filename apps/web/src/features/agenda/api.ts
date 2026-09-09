import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ActualizarEventoInput, CrearEventoInput, EventoAgenda, FiltroAgenda } from './types';

export function useEventosAgenda(filtro: FiltroAgenda) {
  return useQuery({
    queryKey: ['agenda', filtro],
    queryFn: () => api.get<EventoAgenda[]>(`/agenda?filtro=${filtro}`),
  });
}

export function useCrearEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearEventoInput) => api.post<EventoAgenda>('/agenda', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}

export function useActualizarEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarEventoInput }) =>
      api.patch<EventoAgenda>(`/agenda/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}

export function useEliminarEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/agenda/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}
