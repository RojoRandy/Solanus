import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ResumenDashboard } from './types';

export function useResumenDashboard(diasVencimiento = 15) {
  return useQuery({
    queryKey: ['dashboard', 'resumen', diasVencimiento],
    queryFn: () => api.get<ResumenDashboard>(`/dashboard/resumen?diasVencimiento=${diasVencimiento}`),
  });
}
