import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserPlus, AlertCircle } from 'lucide-react';
import { UserRoles } from '@comedor-solanus/shared';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SpinnerOverlay } from '@/components/ui/spinner';
import { PaginationControls } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePaginacion } from '@/lib/pagination';
import { useComensales } from './api';
import type { Comensal } from './types';

const DEBOUNCE_MS = 350;

export function ComensalesListView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const puedeCrear = user?.rol !== UserRoles.USUARIO_SIMPLE;

  const [busquedaInput, setBusquedaInput] = React.useState('');
  const [busqueda, setBusqueda] = React.useState('');
  const [activo, setActivo] = React.useState<'true' | 'false'>('true');
  const { page, limit, setPage, resetPagina } = usePaginacion();

  React.useEffect(() => {
    const timeout = setTimeout(() => setBusqueda(busquedaInput.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [busquedaInput]);

  React.useEffect(() => {
    resetPagina();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetear página solo cuando cambian los filtros, no en cada render
  }, [busqueda, activo]);

  const { data, isLoading, isFetching, isError, refetch } = useComensales({
    busqueda: busqueda || undefined,
    activo,
    page,
    limit,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comensales</h1>
          <p className="text-sm text-muted-foreground">
            Registro y expedientes de las personas que reciben apoyo en el comedor.
          </p>
        </div>
        {puedeCrear && (
          <Button onClick={() => navigate('/comensales/nuevo')}>
            <UserPlus data-icon="inline-start" />
            Nuevo comensal
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            placeholder="Buscar por folio, nombre o apellido..."
            className="pl-8"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-[3px]">
          <Button
            type="button"
            size="sm"
            variant={activo === 'true' ? 'default' : 'ghost'}
            onClick={() => setActivo('true')}
          >
            Activos
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activo === 'false' ? 'default' : 'ghost'}
            onClick={() => setActivo('false')}
          >
            Inactivos
          </Button>
        </div>
      </div>

      {isLoading && <TablaCargando />}

      {isError && !isLoading && (
        <EmptyState
          icon={AlertCircle}
          title="No se pudo cargar la lista de comensales"
          description="Ocurrió un problema al conectar con el servidor. Intenta de nuevo."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={Users}
          title={busqueda ? 'Sin resultados' : 'Todavía no hay comensales registrados'}
          description={
            busqueda
              ? `No encontramos comensales que coincidan con "${busqueda}".`
              : 'Da de alta al primer comensal para comenzar a construir su expediente.'
          }
          action={
            puedeCrear && !busqueda ? (
              <Button onClick={() => navigate('/comensales/nuevo')}>Nuevo comensal</Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl border border-border">
            {isFetching && !isLoading && <SpinnerOverlay className="absolute inset-0 z-10 bg-background/70 py-0" />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((comensal) => (
                  <FilaComensal key={comensal.id} comensal={comensal} />
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls meta={data.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

function FilaComensal({ comensal }: { comensal: Comensal }) {
  const navigate = useNavigate();
  return (
    <TableRow
      className="animate-in fade-in cursor-pointer transition-colors"
      onClick={() => navigate(`/comensales/${comensal.id}`)}
    >
      <TableCell className="font-medium">{comensal.folio}</TableCell>
      <TableCell>
        {comensal.nombres} {comensal.apellidos}
      </TableCell>
      <TableCell>{comensal.edad} años</TableCell>
      <TableCell>
        {comensal.tutor ? (
          <span className="text-muted-foreground">
            Menor — tutor: {comensal.tutor.nombres} {comensal.tutor.apellidos}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={comensal.activo ? 'default' : 'outline'}>
          {comensal.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function TablaCargando() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}
