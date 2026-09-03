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
  itemId: number;
  nombre: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
}

export interface MovimientoResumen {
  itemNombre: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export interface ReporteInventario {
  existencias: ExistenciaReporte[];
  movimientosPorTipo: { ENTRADA: number; SALIDA: number; AJUSTE: number };
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
