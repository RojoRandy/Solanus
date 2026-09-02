import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { HorarioComida, MetodoCaptura, Turno, TurnoResumen } from './types';

const QK = {
  turno: (fecha: string | undefined, horario: HorarioComida) => ['asistencia', 'turno', fecha, horario] as const,
  turnos: (fecha: string | undefined) => ['asistencia', 'turnos', fecha] as const,
};

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function useTurno(horario: HorarioComida, fecha?: string) {
  return useQuery({
    queryKey: QK.turno(fecha, horario),
    queryFn: () => api.get<Turno>(`/asistencia/turno${buildQuery({ fecha, horario })}`),
  });
}

export function useTurnosDelDia(fecha?: string) {
  return useQuery({
    queryKey: QK.turnos(fecha),
    queryFn: () => api.get<TurnoResumen[]>(`/asistencia/turnos${buildQuery({ fecha })}`),
  });
}

function useInvalidateTurno() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['asistencia'] });
}

export function useActualizarTurno() {
  const invalidate = useInvalidateTurno();
  return useMutation({
    mutationFn: ({ turnoId, menu, notas }: { turnoId: number; menu?: string; notas?: string }) =>
      api.patch<Turno>(`/asistencia/turnos/${turnoId}`, { menu, notas }),
    onSuccess: invalidate,
  });
}

export function useRegistrarAsistencia() {
  const invalidate = useInvalidateTurno();
  return useMutation({
    mutationFn: ({ turnoId, comensalId, metodoCaptura }: { turnoId: number; comensalId: number; metodoCaptura?: MetodoCaptura }) =>
      api.post(`/asistencia/turnos/${turnoId}/asistencias`, { comensalId, metodoCaptura }),
    onSuccess: invalidate,
  });
}

export function useEliminarAsistencia() {
  const invalidate = useInvalidateTurno();
  return useMutation({
    mutationFn: (asistenciaId: number) => api.delete(`/asistencia/asistencias/${asistenciaId}`),
    onSuccess: invalidate,
  });
}

export function useAsignarVoluntario() {
  const invalidate = useInvalidateTurno();
  return useMutation({
    mutationFn: ({ turnoId, voluntarioId }: { turnoId: number; voluntarioId: number }) =>
      api.post(`/asistencia/turnos/${turnoId}/voluntarios`, { voluntarioId }),
    onSuccess: invalidate,
  });
}

export function useQuitarVoluntario() {
  const invalidate = useInvalidateTurno();
  return useMutation({
    mutationFn: ({ turnoId, voluntarioId }: { turnoId: number; voluntarioId: number }) =>
      api.delete(`/asistencia/turnos/${turnoId}/voluntarios/${voluntarioId}`),
    onSuccess: invalidate,
  });
}

export function useRegistrarInsumoTurno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ turnoId, itemId, cantidad, motivoId, notas }: { turnoId: number; itemId: number; cantidad: number; motivoId?: number; notas?: string }) =>
      api.post(`/asistencia/turnos/${turnoId}/insumos`, { itemId, cantidad, motivoId, notas }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}
