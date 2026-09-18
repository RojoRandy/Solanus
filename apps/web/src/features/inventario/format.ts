import type { Producto } from './types';

/**
 * `fecha`/`fechaCorta` formatean campos *solo-fecha* del API (`@db.Date`:
 * caducidad, ingreso de lote, fecha de donativo) — llegan serializados como
 * medianoche UTC. Se leen en UTC (no en la zona del navegador ni en la de
 * México) para no correr el día calendario un día atrás; ver `formatFechaCortaTz`
 * en `@/lib/fecha` para campos que sí son un instante real (con hora).
 */
export function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatFechaCorta(fecha: string | Date | null | undefined): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
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

export function etiquetaProducto(producto: Producto): string {
  const { contenido, unidad } = producto;
  return [
    producto.nombre,
    contenido ? formatCantidad(contenido.cantidad, contenido.unidad.abrevia) : '',
    unidad.abrevia !== contenido?.unidad.abrevia ? unidad.abrevia : '',
    producto.granel || producto.marca ? etiquetaMarcaLote(producto) : '',
  ].filter((tramo) => tramo.trim() !== '').join(' · ');
}
