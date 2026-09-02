import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  ActualizarInventarioItemInput,
  CategoriaRef,
  CrearInventarioItemInput,
  InventarioItem,
  Lote,
  Movimiento,
  MotivoRef,
  ProximoAVencer,
  RegistrarEntradaInput,
  RegistrarSalidaInput,
  StockBajoItem,
  TipoMovimiento,
  UbicacionRef,
  UnidadRef,
} from './types';

const QK = {
  items: (params?: { buscar?: string; incluirInactivos?: boolean }) =>
    ['inventario', 'items', params] as const,
  item: (id: number) => ['inventario', 'items', id] as const,
  movimientos: (params?: {
    itemId?: number;
    turnoId?: number;
    tipo?: TipoMovimiento;
    desde?: string;
    hasta?: string;
  }) => ['inventario', 'movimientos', params] as const,
  categorias: ['inventario', 'categorias'] as const,
  unidades: ['inventario', 'unidades'] as const,
  ubicaciones: ['inventario', 'ubicaciones'] as const,
  motivos: ['inventario', 'motivos'] as const,
  stockBajo: ['inventario', 'stock-bajo'] as const,
  proximosAVencer: (dias: number) => ['inventario', 'proximos-a-vencer', dias] as const,
};

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ── Productos (InventarioItem) ──

export function useInventarioItems(params?: { buscar?: string; incluirInactivos?: boolean }) {
  return useQuery({
    queryKey: QK.items(params),
    queryFn: () => api.get<InventarioItem[]>(`/inventario/items${buildQuery(params ?? {})}`),
  });
}

export function useInventarioItem(id: number | undefined) {
  return useQuery({
    queryKey: QK.item(id ?? 0),
    queryFn: () => api.get<InventarioItem>(`/inventario/items/${id}`),
    enabled: id !== undefined,
  });
}

export function useCrearInventarioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearInventarioItemInput) =>
      api.post<InventarioItem>('/inventario/items', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'items'] });
    },
  });
}

export function useActualizarInventarioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarInventarioItemInput }) =>
      api.patch<InventarioItem>(`/inventario/items/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'items'] });
    },
  });
}

export function useEliminarInventarioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/inventario/items/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'items'] });
    },
  });
}

// ── Lotes (entradas) ──

export function useRegistrarEntrada() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarEntradaInput) => api.post<Lote>('/inventario/entradas', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

// ── Salidas ──

export function useRegistrarSalida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarSalidaInput) => api.post('/inventario/salidas', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

// ── Movimientos ──

export function useMovimientos(params?: {
  itemId?: number;
  turnoId?: number;
  tipo?: TipoMovimiento;
  desde?: string;
  hasta?: string;
}) {
  return useQuery({
    queryKey: QK.movimientos(params),
    queryFn: () => api.get<Movimiento[]>(`/inventario/movimientos${buildQuery(params ?? {})}`),
  });
}

// ── Catálogos de solo lectura ──

export function useCategorias() {
  return useQuery({
    queryKey: QK.categorias,
    queryFn: () => api.get<CategoriaRef[]>('/inventario/categorias'),
  });
}

export function useUnidades() {
  return useQuery({
    queryKey: QK.unidades,
    queryFn: () => api.get<UnidadRef[]>('/inventario/unidades'),
  });
}

export function useUbicaciones() {
  return useQuery({
    queryKey: QK.ubicaciones,
    queryFn: () => api.get<UbicacionRef[]>('/inventario/ubicaciones'),
  });
}

export function useMotivos() {
  return useQuery({
    queryKey: QK.motivos,
    queryFn: () => api.get<MotivoRef[]>('/inventario/motivos'),
  });
}

// ── Reportes ──

export function useStockBajo() {
  return useQuery({
    queryKey: QK.stockBajo,
    queryFn: () => api.get<StockBajoItem[]>('/inventario/stock-bajo'),
  });
}

export function useProximosAVencer(dias = 15) {
  return useQuery({
    queryKey: QK.proximosAVencer(dias),
    queryFn: () => api.get<ProximoAVencer[]>(`/inventario/proximos-a-vencer?dias=${dias}`),
  });
}
