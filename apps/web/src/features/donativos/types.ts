export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' | 'DEPOSITO';

export const ETIQUETA_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
  DEPOSITO: 'Depósito',
};

export interface DonativoDinero {
  id: number;
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  folioRecibo: string | null;
  nota: string | null;
  bienhechor: { id: number; nombre: string };
  turno: { id: number; fecha: string; horario: 'DESAYUNO' | 'COMIDA' | 'CENA' } | null;
  registradoPor: { id: number; nombre: string };
  createdAt: string;
}

export interface RegistrarDonativoDineroPayload {
  bienhechorId: number;
  monto: number;
  fecha?: string;
  metodoPago: MetodoPago;
  folioRecibo?: string;
  nota?: string;
  turnoId?: number;
}

export interface ListarDonativosDineroParams {
  bienhechorId?: number;
  turnoId?: number;
  metodoPago?: MetodoPago;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
}

export interface ListaDonativosDinero {
  items: DonativoDinero[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
  };
  totalMonto: number;
}
