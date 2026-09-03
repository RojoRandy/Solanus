export interface CategoriaRef {
  id: number;
  nombre: string;
  activo?: boolean;
}

export interface UnidadRef {
  id: number;
  nombre: string;
  abrevia: string;
  activo?: boolean;
}

export interface MotivoRef {
  id: number;
  nombre: string;
  clave?: string;
  esMerma?: boolean;
}

export type EstadoProducto = 'CRUDO' | 'COCIDO' | 'NO_APLICA';

export const ETIQUETA_ESTADO: Record<EstadoProducto, string> = {
  CRUDO: 'Crudo',
  COCIDO: 'Cocido',
  NO_APLICA: 'No aplica',
};

export interface Producto {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  categoria: CategoriaRef;
  activo: boolean;
  createdAt: string;
}

export interface CrearProductoInput {
  nombre: string;
  codigoBarras?: string;
  categoriaId: number;
}

export type ActualizarProductoInput = Partial<CrearProductoInput> & { activo?: boolean };

export interface Variante {
  id: number;
  producto: { id: number; nombre: string };
  categoria: CategoriaRef;
  unidad: UnidadRef;
  estado: EstadoProducto;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  activo: boolean;
}

export interface ActualizarVarianteInput {
  stockMinimo?: number;
  activo?: boolean;
}

export type OrigenLote = 'COMPRADO' | 'DONADO';

/**
 * Orden de captura de la pantalla "Registrar entrada": estado → cantidad →
 * costo unitario → costo total → unidad → marca → cfdi → caducidad →
 * ingreso → origen → bienhechor → presentación/ubicación (opcionales).
 */
export interface RegistrarEntradaInput {
  productoId?: number;
  productoNuevo?: CrearProductoInput;
  estado: EstadoProducto;
  cantidadInicial: number;
  costoUnitario: number;
  costoTotal?: number;
  unidadId: number;
  marca?: string;
  cfdi?: string;
  fechaCaducidad?: string;
  noCaduca?: boolean;
  fechaIngreso?: string;
  origen: OrigenLote;
  bienhechorId?: number;
  presentacion?: string;
  ubicacion?: string;
}

export interface LoteVarianteRef {
  id: number;
  productoNombre: string;
  unidadAbrevia: string;
  estado: EstadoProducto;
}

export interface Lote {
  id: number;
  variante: LoteVarianteRef;
  marca: string | null;
  presentacion: string | null;
  ubicacion: string | null;
  cantidadInicial: number;
  cantidadDisponible: number;
  fechaCaducidad: string | null;
  fechaIngreso: string;
  costoUnitario: number | null;
  costoTotal: number | null;
  origen: OrigenLote;
  bienhechor: { id: number; nombre: string } | null;
  cfdi: string | null;
}

export interface LoteVivo {
  id: number;
  marca: string | null;
  cantidadDisponible: number;
  fechaCaducidad: string | null;
  fechaIngreso: string;
  costoUnitario: number | null;
  origen: OrigenLote;
  bienhechor: { id: number; nombre: string } | null;
}

export interface LineaDonativoInput {
  productoId?: number;
  productoNuevo?: CrearProductoInput;
  estado: EstadoProducto;
  cantidad: number;
  unidadId: number;
  costoUnitario?: number;
  fechaCaducidad?: string;
}

export interface RegistrarDonativoInput {
  bienhechorId: number;
  fechaIngreso?: string;
  lineas: LineaDonativoInput[];
}

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface RegistrarSalidaInput {
  varianteId: number;
  cantidad: number;
  motivoId: number;
  turnoId?: number;
  notas?: string;
}

export interface RegistrarAjusteInput {
  varianteId: number;
  /** Delta con signo: positivo agrega a `loteId` (obligatorio), negativo descuenta FEFO. */
  cantidad: number;
  motivoId: number;
  loteId?: number;
  notas: string;
}

export interface Movimiento {
  id: number;
  producto: { id: number; nombre: string };
  variante: { id: number; estado: EstadoProducto; unidad: { id: number; abrevia: string } };
  loteId: number | null;
  tipo: TipoMovimiento;
  motivo: MotivoRef;
  cantidad: number;
  turnoId: number | null;
  registradoPor: { id: number; nombre: string };
  fecha: string;
  notas: string | null;
  editado: boolean;
}

export interface ActualizarMovimientoInput {
  fecha?: string;
  motivoId?: number;
  notas?: string;
}

export interface ProximoAVencer {
  loteId: number;
  varianteId: number;
  productoNombre: string;
  unidad: string;
  estado: EstadoProducto;
  cantidadDisponible: number;
  fechaCaducidad: string;
}

export interface StockBajoItem {
  varianteId: number;
  productoNombre: string;
  unidad: string;
  estado: EstadoProducto;
  stockActual: number;
  stockMinimo: number;
}

export interface CrearUnidadInput {
  nombre: string;
  abrevia: string;
}
export type ActualizarUnidadInput = Partial<CrearUnidadInput> & { activo?: boolean };

export interface CrearCategoriaInput {
  nombre: string;
}
export type ActualizarCategoriaInput = Partial<CrearCategoriaInput> & { activo?: boolean };
