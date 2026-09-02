export interface CategoriaRef {
  id: number;
  nombre: string;
}

export interface UnidadRef {
  id: number;
  nombre: string;
  abrevia: string;
}

export interface UbicacionRef {
  id: number;
  nombre: string;
}

export interface MotivoRef {
  id: number;
  nombre: string;
}

export interface InventarioItem {
  id: number;
  nombre: string;
  marca: string | null;
  codigoBarras: string | null;
  categoria: CategoriaRef;
  unidad: UnidadRef;
  presentacion: string | null;
  ubicacion: UbicacionRef | null;
  stockMinimo: number;
  stockActual: number;
  stockBajo: boolean;
  activo: boolean;
  createdAt: string;
}

export interface CrearInventarioItemInput {
  nombre: string;
  marca?: string;
  codigoBarras?: string;
  categoriaId: number;
  unidadId: number;
  presentacion?: string;
  ubicacionId?: number;
  stockMinimo?: number;
}

export type ActualizarInventarioItemInput = Partial<CrearInventarioItemInput> & {
  activo?: boolean;
};

export type OrigenLote = 'COMPRADO' | 'DONADO';

export interface RegistrarEntradaInput {
  itemId?: number;
  itemNuevo?: CrearInventarioItemInput;
  cantidadInicial: number;
  fechaCaducidad?: string;
  fechaIngreso?: string;
  costoUnitario?: number;
  costoTotal?: number;
  origen: OrigenLote;
  bienhechorId?: number;
  numeroFactura?: string;
  cfdi?: string;
}

export interface Lote {
  id: number;
  item: { id: number; nombre: string };
  cantidadInicial: number;
  cantidadDisponible: number;
  fechaCaducidad: string | null;
  fechaIngreso: string;
  costoUnitario: number | null;
  costoTotal: number | null;
  origen: OrigenLote;
  bienhechor: { id: number; nombre: string } | null;
  numeroFactura: string | null;
  cfdi: string | null;
}

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface RegistrarSalidaInput {
  itemId: number;
  cantidad: number;
  motivoId: number;
  turnoId?: number;
  notas?: string;
}

export interface Movimiento {
  id: number;
  item: { id: number; nombre: string };
  loteId: number | null;
  tipo: TipoMovimiento;
  motivo: MotivoRef;
  cantidad: number;
  turnoId: number | null;
  registradoPor: { id: number; nombre: string };
  fecha: string;
  notas: string | null;
}

export interface ProximoAVencer {
  loteId: number;
  itemId: number;
  itemNombre: string;
  cantidadDisponible: number;
  fechaCaducidad: string;
}

export interface StockBajoItem {
  itemId: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
}
