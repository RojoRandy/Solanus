export interface FilaAsistencia {
  folio: number;
  nombre: string;
  dias: number[];
  total: number;
}

export interface ReporteAsistencia {
  anio: number;
  mes: number;
  diasDelMes: number;
  comensales: FilaAsistencia[];
  totalesPorDia: number[];
  totalAsistencias: number;
  desayuno: number;
  comida: number;
  cena: number;
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

