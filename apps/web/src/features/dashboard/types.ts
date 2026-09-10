import type { ProximoAVencer, StockBajoItem } from '@/features/inventario/types';

export type { ProximoAVencer, StockBajoItem };

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
