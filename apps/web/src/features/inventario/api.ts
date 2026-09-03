import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Paginated } from '@/lib/pagination';
import type {
  ActualizarCategoriaInput,
  ActualizarMovimientoInput,
  ActualizarProductoInput,
  ActualizarUnidadInput,
  ActualizarVarianteInput,
  CategoriaRef,
  CrearCategoriaInput,
  CrearProductoInput,
  CrearUnidadInput,
  EstadoProducto,
  Lote,
  LoteVivo,
  Movimiento,
  MotivoRef,
  Producto,
  ProximoAVencer,
  RegistrarAjusteInput,
  RegistrarDonativoInput,
  RegistrarEntradaInput,
  RegistrarSalidaInput,
  StockBajoItem,
  TipoMovimiento,
  UnidadRef,
  Variante,
} from './types';

interface PaginacionParams {
  page?: number;
  limit?: number;
}

const QK = {
  productos: (params?: PaginacionParams & { buscar?: string; categoriaId?: number; incluirInactivos?: boolean }) =>
    ['inventario', 'productos', params] as const,
  producto: (id: number) => ['inventario', 'productos', id] as const,
  variantes: (
    params?: PaginacionParams & {
      buscar?: string;
      productoId?: number;
      categoriaId?: number;
      unidadId?: number;
      estado?: EstadoProducto;
      soloStockBajo?: boolean;
      incluirInactivas?: boolean;
    },
  ) => ['inventario', 'variantes', params] as const,
  variante: (id: number) => ['inventario', 'variantes', id] as const,
  movimientos: (
    params?: PaginacionParams & {
      varianteId?: number;
      productoId?: number;
      categoriaId?: number;
      turnoId?: number;
      tipo?: TipoMovimiento;
      desde?: string;
      hasta?: string;
    },
  ) => ['inventario', 'movimientos', params] as const,
  categorias: ['inventario', 'categorias'] as const,
  unidades: ['inventario', 'unidades'] as const,
  motivos: ['inventario', 'motivos'] as const,
  stockBajo: ['inventario', 'stock-bajo'] as const,
  proximosAVencer: (dias: number) => ['inventario', 'proximos-a-vencer', dias] as const,
};

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ── Productos ──

export function useProductos(params?: PaginacionParams & { buscar?: string; categoriaId?: number; incluirInactivos?: boolean }) {
  return useQuery({
    queryKey: QK.productos(params),
    queryFn: () => api.get<Paginated<Producto>>(`/inventario/productos${buildQuery(params ?? {})}`),
    placeholderData: keepPreviousData,
  });
}

export function useProducto(id: number | undefined) {
  return useQuery({
    queryKey: QK.producto(id ?? 0),
    queryFn: () => api.get<Producto>(`/inventario/productos/${id}`),
    enabled: id !== undefined,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearProductoInput) => api.post<Producto>('/inventario/productos', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'productos'] });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarProductoInput }) =>
      api.patch<Producto>(`/inventario/productos/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'productos'] });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/inventario/productos/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

// ── Variantes (producto × unidad × estado — existencias) ──

export function useVariantes(
  params?: PaginacionParams & {
    buscar?: string;
    productoId?: number;
    categoriaId?: number;
    unidadId?: number;
    estado?: EstadoProducto;
    soloStockBajo?: boolean;
    incluirInactivas?: boolean;
  },
) {
  return useQuery({
    queryKey: QK.variantes(params),
    queryFn: () => api.get<Paginated<Variante>>(`/inventario/variantes${buildQuery(params ?? {})}`),
    placeholderData: keepPreviousData,
  });
}

export function useVariante(id: number | undefined) {
  return useQuery({
    queryKey: QK.variante(id ?? 0),
    queryFn: () => api.get<Variante>(`/inventario/variantes/${id}`),
    enabled: id !== undefined,
  });
}

export function useLotesVariante(id: number | undefined) {
  return useQuery({
    queryKey: [...QK.variante(id ?? 0), 'lotes'],
    queryFn: () => api.get<LoteVivo[]>(`/inventario/variantes/${id}/lotes`),
    enabled: id !== undefined,
  });
}

export function useActualizarVariante() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarVarianteInput }) =>
      api.patch<Variante>(`/inventario/variantes/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'variantes'] });
    },
  });
}

// ── Lotes (entradas y donativos) ──

export function useRegistrarEntrada() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarEntradaInput) => api.post<Lote>('/inventario/entradas', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

export function useRegistrarDonativo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarDonativoInput) => api.post<{ lotes: Lote[] }>('/inventario/donativos', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

// ── Salidas y ajustes ──

export function useRegistrarSalida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarSalidaInput) => api.post('/inventario/salidas', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

export function useRegistrarAjuste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarAjusteInput) => api.post('/inventario/ajustes', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    },
  });
}

// ── Movimientos ──

export function useMovimientos(
  params?: PaginacionParams & {
    varianteId?: number;
    productoId?: number;
    categoriaId?: number;
    turnoId?: number;
    tipo?: TipoMovimiento;
    desde?: string;
    hasta?: string;
  },
) {
  return useQuery({
    queryKey: QK.movimientos(params),
    queryFn: () => api.get<Paginated<Movimiento>>(`/inventario/movimientos${buildQuery(params ?? {})}`),
    placeholderData: keepPreviousData,
  });
}

export function useActualizarMovimiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarMovimientoInput }) =>
      api.patch<Movimiento>(`/inventario/movimientos/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventario', 'movimientos'] });
    },
  });
}

// ── Catálogos ──

export function useCategorias() {
  return useQuery({
    queryKey: QK.categorias,
    queryFn: () => api.get<CategoriaRef[]>('/inventario/categorias'),
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearCategoriaInput) => api.post<CategoriaRef>('/inventario/categorias', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.categorias });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarCategoriaInput }) =>
      api.patch<CategoriaRef>(`/inventario/categorias/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.categorias });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/inventario/categorias/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.categorias });
    },
  });
}

export function useUnidades() {
  return useQuery({
    queryKey: QK.unidades,
    queryFn: () => api.get<UnidadRef[]>('/inventario/unidades'),
  });
}

export function useCrearUnidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearUnidadInput) => api.post<UnidadRef>('/inventario/unidades', dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.unidades });
    },
  });
}

export function useActualizarUnidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarUnidadInput }) =>
      api.patch<UnidadRef>(`/inventario/unidades/${id}`, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.unidades });
    },
  });
}

export function useEliminarUnidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/inventario/unidades/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.unidades });
    },
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
