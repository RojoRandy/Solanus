export interface Periodo {
  anio: number;
  mes: number; // 1-12
}

export function periodoActual(): Periodo {
  const hoy = new Date();
  return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 };
}

/** Query string `?anio=&mes=` para los endpoints que ya reciben el periodo directo. */
export function queryPeriodo(periodo: Periodo): string {
  return `?anio=${periodo.anio}&mes=${periodo.mes}`;
}

/**
 * Rango [desde, hasta] en YYYY-MM-DD para los endpoints que aún reciben `desde`/`hasta`
 * (inventario, donativos). `hasta` es el último día del mes, inclusive.
 */
export function rangoDelMes(periodo: Periodo): { desde: string; hasta: string } {
  const ultimoDia = new Date(periodo.anio, periodo.mes, 0).getDate();
  const mm = String(periodo.mes).padStart(2, '0');
  return {
    desde: `${periodo.anio}-${mm}-01`,
    hasta: `${periodo.anio}-${mm}-${String(ultimoDia).padStart(2, '0')}`,
  };
}

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function etiquetaPeriodo(periodo: Periodo): string {
  return `${NOMBRES_MES[periodo.mes - 1]} ${periodo.anio}`;
}

export function mesAnterior(periodo: Periodo): Periodo {
  return periodo.mes === 1 ? { anio: periodo.anio - 1, mes: 12 } : { anio: periodo.anio, mes: periodo.mes - 1 };
}

export function mesSiguiente(periodo: Periodo): Periodo {
  return periodo.mes === 12 ? { anio: periodo.anio + 1, mes: 1 } : { anio: periodo.anio, mes: periodo.mes + 1 };
}
