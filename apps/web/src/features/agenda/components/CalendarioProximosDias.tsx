import * as React from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useEventosAgenda } from '../api';
import { estiloEvento } from '../estilo-evento';
import type { EventoAgenda } from '../types';
import { EventosDelDiaDialog } from './EventosDelDiaDialog';

const DIAS_A_MOSTRAR = 5;

function claveDia(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd');
}

/**
 * Calendario de los próximos 5 días. Agrupa en cliente sobre todos los
 * eventos próximos que trae la API — se usa igual en Agenda y en el Panel general.
 * // ponytail: agrupa en cliente sobre todos los próximos; paginar si la agenda crece a cientos de eventos.
 */
export function CalendarioProximosDias() {
  const { data: eventos, isLoading, isError } = useEventosAgenda('proximos');
  const [diaSeleccionado, setDiaSeleccionado] = React.useState<Date | null>(null);

  const hoy = new Date();
  const dias = React.useMemo(
    () => Array.from({ length: DIAS_A_MOSTRAR }, (_, i) => addDays(hoy, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe recalcular al montar, no en cada render por el `new Date()`
    [],
  );

  const eventosPorDia = React.useMemo(() => {
    const mapa = new Map<string, EventoAgenda[]>();
    for (const evento of eventos ?? []) {
      const clave = claveDia(new Date(evento.fechaHora));
      const lista = mapa.get(clave) ?? [];
      lista.push(evento);
      mapa.set(clave, lista);
    }
    return mapa;
  }, [eventos]);

  const eventosDelDiaSeleccionado = diaSeleccionado ? (eventosPorDia.get(claveDia(diaSeleccionado)) ?? []) : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: DIAS_A_MOSTRAR }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">No se pudo cargar la agenda.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {dias.map((dia) => {
          const eventosDelDia = (eventosPorDia.get(claveDia(dia)) ?? []).slice().sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
          const esHoy = isSameDay(dia, hoy);

          return (
            <Card key={claveDia(dia)} className="gap-0 overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setDiaSeleccionado(dia)}
                aria-label={`Ver eventos del ${format(dia, "d 'de' MMMM 'de' yyyy", { locale: es })}`}
                className={cn(
                  'flex w-full flex-col gap-2 p-3 text-left transition-colors hover:bg-muted/50',
                  esHoy && 'bg-accent/40',
                )}
              >
                <span className={cn('text-xs font-medium', esHoy ? 'text-foreground' : 'text-muted-foreground')}>
                  {format(dia, 'd - MMMM - yyyy', { locale: es })}
                </span>
                {eventosDelDia.length === 0 ? (
                  <span className="py-3 text-center text-xs text-muted-foreground">Sin eventos programados</span>
                ) : (
                  // max-h-36 ≈ 3 eventos visibles; el resto se ve haciendo scroll o con clic en el día.
                  <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1">
                    {eventosDelDia.map((evento) => (
                      <div key={evento.id} className="flex flex-col gap-1 rounded-md border px-2 py-1" style={estiloEvento(evento.color)}>
                        <span className="text-[11px] font-semibold">{format(new Date(evento.fechaHora), 'h:mm a')}</span>
                        <Tooltip>
                          <TooltipTrigger render={<span className="truncate text-xs" />}>{evento.descripcion}</TooltipTrigger>
                          <TooltipContent>{evento.descripcion}</TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            </Card>
          );
        })}
      </div>

      <EventosDelDiaDialog
        fecha={diaSeleccionado}
        eventos={eventosDelDiaSeleccionado}
        onOpenChange={(open) => !open && setDiaSeleccionado(null)}
      />
    </>
  );
}
