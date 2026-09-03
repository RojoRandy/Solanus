export interface AsistenciaPorDia {
  fecha: string;
  desayuno: number;
  comida: number;
  cena: number;
  total: number;
}

export interface ReporteAsistencia {
  totalAsistencias: number;
  desayuno: number;
  comida: number;
  cena: number;
  porDia: AsistenciaPorDia[];
}

export interface ExistenciaReporte {
  varianteId: number;
  nombre: string;
  categoria: string;
  unidad: string;
  estado: 'CRUDO' | 'COCIDO' | 'NO_APLICA';
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
}

export interface MovimientoResumen {
  productoNombre: string;
  unidad: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export interface MovimientosPorTipo {
  entradas: number;
  salidas: number;
  ajustesPositivos: number;
  ajustesNegativos: number;
  ajusteNeto: number;
}

export interface ReporteInventario {
  existencias: ExistenciaReporte[];
  movimientosPorTipo: MovimientosPorTipo;
  mermas: MovimientoResumen[];
  caducados: MovimientoResumen[];
}

export interface DonativosPorBienhechor {
  bienhechorId: number;
  bienhechor: string;
  cantidadLotes: number;
  valorEstimado: number;
}

export interface ReporteDonativos {
  totalLotes: number;
  valorEstimado: number;
  porBienhechor: DonativosPorBienhechor[];
}

export interface RangoFecha {
  desde?: string;
  hasta?: string;
}
