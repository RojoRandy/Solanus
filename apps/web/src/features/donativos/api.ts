import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  DonativoDinero,
  ListaDonativosDinero,
  ListarDonativosDineroParams,
  RegistrarDonativoDineroPayload,
} from './types';

function buildQuery(params: ListarDonativosDineroParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function useDonativosDinero(
  params: ListarDonativosDineroParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['donativos', params],
    queryFn: () => api.get<ListaDonativosDinero>(`/donativos${buildQuery(params)}`),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function useRegistrarDonativoDinero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarDonativoDineroPayload) =>
      api.post<DonativoDinero>('/donativos', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['donativos'] });
      void queryClient.invalidateQueries({ queryKey: ['bienhechores'] });
    },
  });
}

export function useEliminarDonativoDinero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/donativos/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['donativos'] });
      void queryClient.invalidateQueries({ queryKey: ['bienhechores'] });
    },
  });
}
