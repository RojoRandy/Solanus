import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { RangoFecha, ReporteAsistencia, ReporteDonativos, ReporteInventario } from './types';

function buildQuery(rango: RangoFecha): string {
  const search = new URLSearchParams();
  if (rango.desde) search.set('desde', rango.desde);
  if (rango.hasta) search.set('hasta', rango.hasta);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function useReporteAsistencia(rango: RangoFecha) {
  return useQuery({
    queryKey: ['reportes', 'asistencia', rango],
    queryFn: () => api.get<ReporteAsistencia>(`/reportes/asistencia${buildQuery(rango)}`),
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
