import type { CSSProperties } from 'react';

/** Fondo tintado al 20% + borde sólido; el texto usa el foreground del tema
 * (no se calcula contraste: el tinte es siempre suave, en claro y oscuro). */
export function estiloEvento(color: string): CSSProperties {
  return { backgroundColor: `${color}33`, borderColor: color };
}
