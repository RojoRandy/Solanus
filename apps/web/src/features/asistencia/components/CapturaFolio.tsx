import * as React from 'react';
import { toast } from 'sonner';
import { Search, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useComensales } from '@/features/comensales/api';
import type { Comensal } from '@/features/comensales/types';
import { ApiError } from '@/lib/api-client';
import { useRegistrarAsistencia } from '../api';
import { resolverFoto, useDebouncedValue } from '../utils';
import type { Turno } from '../types';

function iniciales(nombres: string, apellidos: string): string {
  return `${nombres[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase();
}

/**
 * Captura ágil del punto de servicio: se teclea el folio y Enter registra al
 * instante (igual que anotarlo en la hoja de papel). El listado de
 * coincidencias por nombre o folio se mantiene visible en todo momento —
 * también mientras se teclean dígitos — para poder elegir con un clic.
 */
export function CapturaFolio({ turno }: { turno: Turno }) {
  const [texto, setTexto] = React.useState('');
  const [ultimoRegistrado, setUltimoRegistrado] = React.useState<Comensal | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const busqueda = useDebouncedValue(texto.trim(), 250);

  const { data } = useComensales({ busqueda, activo: 'true', limit: 8 });
  const registrar = useRegistrarAsistencia();

  const yaRegistradosIds = React.useMemo(
    () => new Set(turno.asistencias.map((a) => a.comensal.id)),
    [turno.asistencias],
  );
  const sugerencias = (data?.items ?? []).filter((c) => !yaRegistradosIds.has(c.id)).slice(0, 6);

  function confirmarRegistro(comensal: Comensal, metodoCaptura: 'FOLIO' | 'NOMBRE') {
    registrar.mutate(
      { turnoId: turno.id, comensalId: comensal.id, metodoCaptura },
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;

    const valor = texto.trim();
    if (!valor) return;

    if (/^\d+$/.test(valor)) {
      const folioNum = Number(valor);
      const match = sugerencias.find((c) => c.folio === folioNum) ?? (data?.items ?? []).find((c) => c.folio === folioNum);
      if (match) {
        if (yaRegistradosIds.has(match.id)) {
          toast.error('El comensal ya tiene asistencia registrada en este turno.');
          return;
        }
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

        {texto.trim() && sugerencias.length > 0 && (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border animate-in fade-in">
            {sugerencias.map((comensal) => (
              <button
                key={comensal.id}
                type="button"
                onClick={() => confirmarRegistro(comensal, 'NOMBRE')}
                className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
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

        {texto.trim() && sugerencias.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">Sin coincidencias.</p>
        )}

        {ultimoRegistrado && (
          <div className="flex items-center gap-3 rounded-lg bg-success/10 px-4 py-3 animate-in fade-in slide-in-from-bottom-1">
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
