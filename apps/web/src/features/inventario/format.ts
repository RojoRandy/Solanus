import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '—';
  const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(date, "d 'de' MMMM yyyy", { locale: es });
}

export function formatFechaCorta(fecha: string | Date | null | undefined): string {
  if (!fecha) return '—';
  const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(date, 'dd/MM/yyyy');
}

export function formatMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
}

export function formatCantidad(valor: number, unidad?: string): string {
  const numero = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 }).format(valor);
  return unidad ? `${numero} ${unidad}` : numero;
}

/** Marca de un lote para mostrar: "A granel" si lo es, la marca capturada, o guion. */
export function etiquetaMarcaLote(lote: { marca: string | null; granel: boolean }): string {
  if (lote.granel) return 'A granel';
  return lote.marca ?? '—';
}
