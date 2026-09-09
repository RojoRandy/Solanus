import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Evidencia, ReporteAsistencia, ReporteDonativos, ReporteInventario } from './types';
import { queryPeriodo, type Periodo } from './periodo';

interface RangoFecha {
  desde?: string;
  hasta?: string;
}

function buildQuery(rango: RangoFecha): string {
  const search = new URLSearchParams();
  if (rango.desde) search.set('desde', rango.desde);
  if (rango.hasta) search.set('hasta', rango.hasta);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function useReporteAsistencia(periodo: Periodo) {
  return useQuery({
    queryKey: ['reportes', 'asistencia', periodo],
    queryFn: () => api.get<ReporteAsistencia>(`/reportes/asistencia${queryPeriodo(periodo)}`),
  });
}

export function useReporteInventario(rango: RangoFecha) {
  return useQuery({
    queryKey: ['reportes', 'inventario', rango],
    queryFn: () => api.get<ReporteInventario>(`/reportes/inventario${buildQuery(rango)}`),
  });
}

export function useReporteDonativos(rango: RangoFecha) {
  return useQuery({
    queryKey: ['reportes', 'donativos', rango],
    queryFn: () => api.get<ReporteDonativos>(`/reportes/donativos${buildQuery(rango)}`),
  });
}

export function useEvidencias(periodo: Periodo) {
  return useQuery({
    queryKey: ['reportes', 'evidencias', periodo],
    queryFn: () => api.get<Evidencia[]>(`/evidencias${queryPeriodo(periodo)}`),
  });
}

export function useSubirEvidencia(periodo: Periodo) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('foto', file);
      return api.upload<Evidencia>(`/evidencias${queryPeriodo(periodo)}`, formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reportes', 'evidencias', periodo] });
    },
  });
}

export function useEliminarEvidencia(periodo: Periodo) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/evidencias/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reportes', 'evidencias', periodo] });
    },
  });
}
