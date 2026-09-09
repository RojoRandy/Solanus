import * as React from 'react';
import { resolverUrlArchivo } from '@/lib/api-client';

/** Convierte una ruta pública ("/uploads/comensales/3/foto.jpg") en URL absoluta cargable. */
export function resolverFoto(fotoPath: string | null | undefined): string | undefined {
  if (!fotoPath) return undefined;
  return resolverUrlArchivo(fotoPath);
}

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}
