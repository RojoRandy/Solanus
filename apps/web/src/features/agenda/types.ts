export interface EventoAgenda {
  id: number;
  fechaHora: string;
  descripcion: string;
  color: string; // hex #RRGGBB
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearEventoInput {
  fechaHora: string;
  descripcion: string;
  color: string;
}

export type ActualizarEventoInput = Partial<CrearEventoInput> & { activo?: boolean };

export type FiltroAgenda = 'proximos' | 'pasados';
