import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, PencilLine, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SpinnerOverlay } from '@/components/ui/spinner';
import { PaginationControls } from '@/components/ui/pagination';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { ComboboxField } from './ComboboxField';
import { EditarMovimientoDialog } from './components/EditarMovimientoDialog';
import { RegistrarAjusteDialog } from './components/RegistrarAjusteDialog';
import { useCategorias, useMovimientos, useVariantes } from './api';
import { usePaginacion } from '@/lib/pagination';
import { formatCantidad, formatFechaCorta } from './format';
import type { Movimiento } from './types';

const ETIQUETA_TIPO: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

export function MovimientosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const puedeEditar = user?.rol === 'ADMINISTRADOR' || user?.rol === 'USUARIO';

  const { data: variantesPag } = useVariantes({ limit: 200, incluirInactivas: true });
  const { data: categorias } = useCategorias();
  const [varianteId, setVarianteId] = useState<number | undefined>(undefined);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [desde, setDesde] = useState<string | undefined>(undefined);
  const [hasta, setHasta] = useState<string | undefined>(undefined);
  const { page, limit, setPage, resetPagina } = usePaginacion();

  const [movimientoEditar, setMovimientoEditar] = useState<Movimiento | null>(null);
  const [ajusteAbierto, setAjusteAbierto] = useState(false);

  const opcionesVariantes = useMemo(
    () =>
      (variantesPag?.items ?? []).map((v) => ({
        value: v.id,
        label: `${v.producto.nombre} · ${v.unidad.abrevia} · ${v.estado === 'CRUDO' ? 'crudo' : 'cocido'}`,
      })),
    [variantesPag],
  );

  const { data, isLoading, isFetching, isError, refetch } = useMovimientos({
    varianteId,
    categoriaId,
    desde,
    hasta,
    page,
    limit,
  });

  const hayFiltros = Boolean(varianteId || categoriaId || desde || hasta);

  function limpiarFiltros() {
    setVarianteId(undefined);
    setCategoriaId(undefined);
    setDesde(undefined);
    setHasta(undefined);
    resetPagina();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Movimientos de inventario</h1>
            <p className="text-sm text-muted-foreground">Histórico de entradas, salidas y ajustes</p>
          </div>
        </div>
        {puedeEditar && (
          <Button variant="outline" onClick={() => setAjusteAbierto(true)}>
            <SlidersHorizontal />
            Registrar ajuste
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <div className="flex min-w-56 flex-col gap-1.5">
          <Label>Producto</Label>
          <ComboboxField
            options={opcionesVariantes}
            value={varianteId}
            onValueChange={(value) => {
              setVarianteId(value);
              resetPagina();
            }}
            placeholder="Todos los productos"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Select
            items={{ todas: 'Todas', ...Object.fromEntries((categorias ?? []).map((c) => [String(c.id), c.nombre])) }}
            value={categoriaId ? String(categoriaId) : 'todas'}
            onValueChange={(value) => {
              setCategoriaId(value === 'todas' ? undefined : Number(value));
              resetPagina();
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categorias?.map((categoria) => (
                <SelectItem key={categoria.id} value={String(categoria.id)}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Desde</Label>
          <DatePicker
            value={desde}
            onChange={(value) => {
              setDesde(value);
              resetPagina();
            }}
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Hasta</Label>
          <DatePicker
            value={hasta}
            onChange={(value) => {
              setHasta(value);
              resetPagina();
            }}
            className="w-44"
          />
        </div>
        {hayFiltros && (
          <Button variant="ghost" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={ClipboardList}
          title="No se pudieron cargar los movimientos"
          description="Ocurrió un problema al consultar el histórico. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="Sin movimientos"
          description="No hay movimientos registrados con estos filtros."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl border">
            {isFetching && !isLoading && <SpinnerOverlay className="absolute inset-0 z-10 bg-background/70 py-0" />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Registró</TableHead>
                  <TableHead>Notas</TableHead>
                  {puedeEditar && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((movimiento) => (
                  <TableRow key={movimiento.id} className="animate-in fade-in">
                    <TableCell>{formatFechaCorta(movimiento.fecha)}</TableCell>
                    <TableCell>
                      <Link to={`/inventario/variantes/${movimiento.variante.id}`} className="transition-colors hover:underline">
                        {movimiento.producto.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>{movimiento.variante.unidad.abrevia}</TableCell>
                    <TableCell>
                      <Badge variant={movimiento.tipo === 'SALIDA' ? 'destructive' : 'secondary'}>
                        {ETIQUETA_TIPO[movimiento.tipo] ?? movimiento.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{movimiento.motivo.nombre}</TableCell>
                    <TableCell className="text-right">{formatCantidad(movimiento.cantidad)}</TableCell>
                    <TableCell className="text-muted-foreground">{movimiento.registradoPor.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {movimiento.notas ?? '—'}
                      {movimiento.editado && <span className="ml-1 text-xs italic">(editado)</span>}
                    </TableCell>
                    {puedeEditar && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => setMovimientoEditar(movimiento)} title="Editar">
                          <PencilLine className="size-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls meta={data.meta} onPageChange={setPage} />
        </div>
      )}

      <EditarMovimientoDialog key={movimientoEditar?.id ?? 'cerrado'} movimiento={movimientoEditar} onOpenChange={(open) => !open && setMovimientoEditar(null)} />
      <RegistrarAjusteDialog open={ajusteAbierto} onOpenChange={setAjusteAbierto} />
    </div>
  );
}
