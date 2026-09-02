import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HeartHandshake, Phone, Plus, SearchX, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api-client';
import { voluntariosApi } from './api';
import { VoluntarioAvatar } from './VoluntarioAvatar';
import { useDebouncedValue } from './use-debounced-value';

type FiltroEstado = 'activos' | 'inactivos' | 'todos';

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
  { value: 'todos', label: 'Todos' },
];

function activoParam(filtro: FiltroEstado): 'true' | 'false' | undefined {
  if (filtro === 'activos') return 'true';
  if (filtro === 'inactivos') return 'false';
  return undefined;
}

export function VoluntariosListView() {
  const [busqueda, setBusqueda] = React.useState('');
  const [filtro, setFiltro] = React.useState<FiltroEstado>('activos');
  const busquedaDebounced = useDebouncedValue(busqueda);

  const query = useQuery({
    queryKey: ['voluntarios', { busqueda: busquedaDebounced, filtro }],
    queryFn: () => voluntariosApi.listar({ busqueda: busquedaDebounced || undefined, activo: activoParam(filtro) }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Voluntarios</h1>
          <p className="text-sm text-muted-foreground">Registro de las personas que apoyan al comedor.</p>
        </div>
        <Button render={<Link to="/voluntarios/nuevo" />}>
          <Plus />
          Nuevo voluntario
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por nombre o apellido…"
          className="max-w-xs"
          aria-label="Buscar voluntario"
        />
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
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
      </div>

      {query.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="flex flex-row items-center gap-3 p-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {query.isError && (
        <EmptyState
          icon={TriangleAlert}
          title="No se pudo cargar la lista de voluntarios"
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
          icon={busquedaDebounced ? SearchX : HeartHandshake}
          title={busquedaDebounced ? 'Sin resultados' : 'Aún no hay voluntarios registrados'}
          description={
            busquedaDebounced
              ? `No encontramos voluntarios que coincidan con "${busquedaDebounced}".`
              : 'Registra al primer voluntario para comenzar.'
          }
          action={
            !busquedaDebounced ? (
              <Button render={<Link to="/voluntarios/nuevo" />}>
                <Plus />
                Nuevo voluntario
              </Button>
            ) : undefined
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((voluntario) => (
            <Link key={voluntario.id} to={`/voluntarios/${voluntario.id}`} className="block">
              <Card className="flex flex-row items-center gap-3 p-4 transition-colors hover:bg-muted/50">
                <VoluntarioAvatar voluntario={voluntario} size="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate font-medium">
                    {voluntario.nombres} {voluntario.apellidos}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="size-3.5" />
                    {voluntario.telefono}
                  </p>
                </div>
                <Badge variant={voluntario.activo ? 'default' : 'outline'}>{voluntario.activo ? 'Activo' : 'Inactivo'}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
