import * as React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Convierte una ruta pública ("/uploads/comensales/3/foto.jpg") en URL absoluta cargable. */
export function resolverFoto(fotoPath: string | null | undefined): string | undefined {
  if (!fotoPath) return undefined;
  return `${API_ORIGIN}${fotoPath}`;
}

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}
