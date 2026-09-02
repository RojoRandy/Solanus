/**
 * Tipos del módulo Asistencia — reflejan los DTOs del backend
 * (apps/api/src/modules/asistencia/dto/*.ts).
 */
export type HorarioComida = 'DESAYUNO' | 'COMIDA' | 'CENA';
export type MetodoCaptura = 'FOLIO' | 'NOMBRE' | 'QR' | 'FACIAL';

export interface ComensalRef {
  id: number;
  folio: number;
  nombres: string;
  apellidos: string;
  fotoPath: string | null;
}

export interface VoluntarioRef {
  id: number;
  nombres: string;
  apellidos: string;
  fotoPath: string | null;
}

export interface Asistencia {
  id: number;
  comensal: ComensalRef;
  metodoCaptura: MetodoCaptura;
  createdAt: string;
}

export interface TurnoVoluntario {
  id: number;
  voluntario: VoluntarioRef;
}

export interface Turno {
  id: number;
  fecha: string;
  horario: HorarioComida;
  menu: string | null;
  notas: string | null;
  totalAsistencias: number;
  asistencias: Asistencia[];
  voluntarios: TurnoVoluntario[];
}

export interface TurnoResumen {
  id: number;
  fecha: string;
  horario: HorarioComida;
  totalAsistencias: number;
}
