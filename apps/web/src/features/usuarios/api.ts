import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ActualizarUsuarioInput, CrearUsuarioInput, Usuario } from './types';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.get<Usuario[]>('/usuarios'),
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearUsuarioInput) => api.post<Usuario>('/usuarios', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useActualizarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarUsuarioInput }) =>
      api.patch<Usuario>(`/usuarios/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/usuarios/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
