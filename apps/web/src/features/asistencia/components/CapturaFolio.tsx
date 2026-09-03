import * as React from 'react';
import { toast } from 'sonner';
import { Search, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useComensales } from '@/features/comensales/api';
import type { Comensal } from '@/features/comensales/types';
import { api, ApiError } from '@/lib/api-client';
import { useRegistrarAsistencia } from '../api';
import { resolverFoto, useDebouncedValue } from '../utils';

function iniciales(nombres: string, apellidos: string): string {
  return `${nombres[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase();
}

/**
 * Captura ágil del punto de servicio: se teclea el folio y Enter registra al
 * instante (igual que anotarlo en la hoja de papel). Si se teclea texto, se
 * muestra una lista de coincidencias por nombre para elegir con un clic —
 * el respaldo para cuando el comensal no recuerda su folio.
 */
export function CapturaFolio({ turnoId }: { turnoId: number }) {
  const [texto, setTexto] = React.useState('');
  const [ultimoRegistrado, setUltimoRegistrado] = React.useState<Comensal | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const busqueda = useDebouncedValue(texto.trim(), 250);
  const esFolio = /^\d+$/.test(busqueda);

  const { data: resultados } = useComensales({ busqueda, activo: 'true' });
  const registrar = useRegistrarAsistencia();

  const sugerencias = (resultados ?? []).slice(0, 6);

  function confirmarRegistro(comensal: Comensal, metodoCaptura: 'FOLIO' | 'NOMBRE') {
    registrar.mutate(
      { turnoId, comensalId: comensal.id, metodoCaptura },
      {
        onSuccess: () => {
          setUltimoRegistrado(comensal);
          setTexto('');
          inputRef.current?.focus();
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar la asistencia.');
        },
      },
    );
  }

  async function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;

    // Se usa `texto` (el valor recién tecleado) en vez de `busqueda` (la versión
    // debounced a 250ms): un Enter inmediatamente después de escribir el folio
    // — típico al capturar rápido, o al automatizar con Playwright — puede
    // llegar antes de que el debounce se actualice, y con `busqueda` el
    // registro se perdía en silencio.
    const valor = texto.trim();
    if (!valor) return;

    if (/^\d+$/.test(valor)) {
      const folioNum = Number(valor);
      // Búsqueda directa e inmediata (no la lista `resultados`, que puede
      // seguir reflejando la búsqueda debounced anterior) para no depender
      // de que el debounce ya haya alcanzado a `texto`.
      const coincidencias = await api.get<Comensal[]>(
        `/comensales?busqueda=${encodeURIComponent(valor)}&activo=true`,
      );
      const match = coincidencias.find((c) => c.folio === folioNum);
      if (match) {
        confirmarRegistro(match, 'FOLIO');
      } else {
        toast.error(`No se encontró ningún comensal con el folio ${valor}.`);
      }
      return;
    }

    if (sugerencias.length === 1) {
      confirmarRegistro(sugerencias[0], 'NOMBRE');
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="captura-folio" className="text-base">
            Registrar asistencia
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="captura-folio"
              ref={inputRef}
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Folio y Enter, o nombre del comensal…"
              className="h-14 pl-10 text-lg"
              autoComplete="off"
            />
          </div>
        </div>

        {texto.trim() && !esFolio && sugerencias.length > 0 && (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
            {sugerencias.map((comensal) => (
              <button
                key={comensal.id}
                type="button"
                onClick={() => confirmarRegistro(comensal, 'NOMBRE')}
                className="flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={resolverFoto(comensal.fotoPath)} />
                  <AvatarFallback>{iniciales(comensal.nombres, comensal.apellidos)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {comensal.nombres} {comensal.apellidos}
                  </span>
                  <span className="text-xs text-muted-foreground">Folio {comensal.folio}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {texto.trim() && !esFolio && sugerencias.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">Sin coincidencias.</p>
        )}

        {ultimoRegistrado && (
          <div className="flex items-center gap-3 rounded-lg bg-success/10 px-4 py-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={resolverFoto(ultimoRegistrado.fotoPath)} />
              <AvatarFallback>
                <UserRound className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-success">
                {ultimoRegistrado.nombres} {ultimoRegistrado.apellidos}
              </span>
              <span className="text-xs text-muted-foreground">Folio {ultimoRegistrado.folio} — asistencia registrada</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
