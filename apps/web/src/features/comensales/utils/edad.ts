import { TZ } from '@/lib/fecha';

/** Edad exacta en años cumplidos — misma lógica que el backend (comparar día/mes/año). */
export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
  if (
    diferenciaMeses < 0 ||
    (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    edad -= 1;
  }
  return edad;
}

export function esMayorDeEdad(fechaNacimiento: Date): boolean {
  return calcularEdad(fechaNacimiento) >= 18;
}

export function formatearFecha(fecha: string | Date): string {
  const valor = typeof fecha === 'string' ? new Date(fecha) : fecha;
  // Solo-fecha: UTC conserva el día, según @/lib/fecha e inventario/format.ts, sin depender del navegador.
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(valor);
}

export function formatearFechaHora(fecha: string | Date): string {
  const valor = typeof fecha === 'string' ? new Date(fecha) : fecha;
  // Sin llamadores actuales: fecha+hora representa un instante real en la zona de México.
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(valor);
}
