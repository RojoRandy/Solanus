import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Plus, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api-client';
import { useEliminarEvento, useEventosAgenda } from './api';
import { CalendarioProximosDias } from './components/CalendarioProximosDias';
import { EventoFormDialog } from './components/EventoFormDialog';
import { estiloEvento } from './estilo-evento';
import type { EventoAgenda, FiltroAgenda } from './types';

const FILTROS: { value: FiltroAgenda; label: string }[] = [
  { value: 'proximos', label: 'Próximos' },
  { value: 'pasados', label: 'Pasados' },
];

export function AgendaPage() {
  const [filtro, setFiltro] = React.useState<FiltroAgenda>('proximos');
  const [eventoEnEdicion, setEventoEnEdicion] = React.useState<EventoAgenda | null>(null);
  const [formularioAbierto, setFormularioAbierto] = React.useState(false);

  const query = useEventosAgenda(filtro);
  const eliminar = useEliminarEvento();

  function abrirNuevo() {
    setEventoEnEdicion(null);
    setFormularioAbierto(true);
  }

  function abrirEdicion(evento: EventoAgenda) {
    setEventoEnEdicion(evento);
    setFormularioAbierto(true);
  }

  async function handleEliminar(evento: EventoAgenda) {
    try {
      await eliminar.mutateAsync(evento.id);
      toast.success('Evento dado de baja');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja el evento');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">Eventos y compromisos del comedor.</p>
        </div>
        <Button onClick={abrirNuevo}>
          <Plus />
          Nuevo evento
        </Button>
      </div>

      <CalendarioProximosDias />

      <div className="flex items-center gap-1 self-start rounded-lg border border-border p-0.5">
        {FILTROS.map((opcion) => (
          <Button
            key={opcion.value}
            type="button"
            size="sm"
            variant={filtro === opcion.value ? 'secondary' : 'ghost'}
            onClick={() => setFiltro(opcion.value)}
          >
            {opcion.label}
          </Button>
        ))}
      </div>

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}

      {query.isError && (
        <EmptyState
          icon={TriangleAlert}
          title="No se pudo cargar la agenda"
          description={query.error instanceof ApiError ? query.error.message : 'Ocurrió un error inesperado. Intenta de nuevo.'}
          action={
            <Button variant="outline" onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      {query.isSuccess && query.data.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title={filtro === 'proximos' ? 'Aún no hay eventos próximos' : 'No hay eventos pasados'}
          description={filtro === 'proximos' ? 'Registra el primer evento para comenzar.' : undefined}
          action={
            filtro === 'proximos' ? (
              <Button onClick={abrirNuevo}>
                <Plus />
                Nuevo evento
              </Button>
            ) : undefined
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <div className="flex flex-col gap-3">
          {query.data.map((evento) => (
            <Card key={evento.id} className="flex-row items-center gap-4 p-4">
              <div
                className="flex shrink-0 flex-col items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium"
                style={estiloEvento(evento.color)}
              >
                {format(new Date(evento.fechaHora), 'h:mm a')}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium">{format(new Date(evento.fechaHora), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                <p className="truncate text-sm text-muted-foreground">{evento.descripcion}</p>
              </div>
              {filtro === 'proximos' && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => abrirEdicion(evento)}>
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>Dar de baja</AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Dar de baja este evento?</AlertDialogTitle>
                        <AlertDialogDescription>&quot;{evento.descripcion}&quot; dejará de aparecer en la agenda.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void handleEliminar(evento)}>Dar de baja</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <EventoFormDialog evento={eventoEnEdicion} open={formularioAbierto} onOpenChange={setFormularioAbierto} />
    </div>
  );
}
