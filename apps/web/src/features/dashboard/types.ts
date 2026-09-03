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

export interface ResumenDashboard {
  totalComensales: number;
  proximosAVencer: ProximoAVencer[];
  stockBajo: StockBajoItem[];
  asistencia: {
    hoy: number;
    promedioUltimos7Dias: number;
    desayunoHoy: number;
    comidaHoy: number;
    cenaHoy: number;
  };
  donativosDelMes: {
    totalLotes: number;
    valorEstimado: number;
  };
}
