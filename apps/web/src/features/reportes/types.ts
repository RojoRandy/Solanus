export interface FilaAsistencia {
  folio: number;
  nombre: string;
  dias: number[];
  total: number;
}

export interface FilaPrimeraVez {
  fecha: string;
  horario: 'DESAYUNO' | 'COMIDA' | 'CENA';
  nombre: string;
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
  /** Asistentes de primera vez: no son comensales y no se suman a los totales de arriba. */
  primeraVez: FilaPrimeraVez[];
  primeraVezPorDia: number[];
  totalPrimeraVez: number;
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

export interface Evidencia {
  id: number;
  anio: number;
  mes: number;
  rutaArchivo: string;
  subidoPor: { id: number; nombre: string };
  createdAt: string;
}

