import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Package, PackagePlus, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { SpinnerOverlay } from '@/components/ui/spinner';
import { PaginationControls } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDebouncedValue } from '@/features/voluntarios/use-debounced-value';
import { usePaginacion } from '@/lib/pagination';
import { useCategorias, useVariantes } from './api';
import { ETIQUETA_ESTADO } from './types';

export function ExistenciasPage() {
  const [buscarInput, setBuscarInput] = useState('');
  const buscar = useDebouncedValue(buscarInput.trim(), 300);
  const [categoriaId, setCategoriaId] = useState<number>();
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const { page, limit, setPage, resetPagina } = usePaginacion();

  const { data: categorias } = useCategorias();
  const { data, isLoading, isFetching, isError, refetch } = useVariantes({
    buscar: buscar || undefined,
    categoriaId,
    soloStockBajo: soloStockBajo || undefined,
    page,
    limit,
  });

  function limpiarFiltros() {
    setBuscarInput('');
    setCategoriaId(undefined);
    setSoloStockBajo(false);
    resetPagina();
  }

  const hayFiltros = Boolean(buscarInput || categoriaId || soloStockBajo);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">Existencias por producto, unidad y estado (crudo/cocido)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link to="movimientos" />}>
            <ClipboardList />
            Movimientos
          </Button>
          <Button variant="outline" render={<Link to="productos" />}>
            <Package />
            Catálogo de productos
          </Button>
          <Button variant="outline" render={<Link to="/configuracion" />}>
            <Settings />
            Configuración
          </Button>
          <Button render={<Link to="registrar-entrada" />}>
            <PackagePlus />
            Registrar entrada
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={buscarInput}
            onChange={(event) => {
              setBuscarInput(event.target.value);
              resetPagina();
            }}
            placeholder="Buscar por nombre de producto…"
            className="pl-8"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Select
            items={{ todas: 'Todas las categorías', ...Object.fromEntries((categorias ?? []).map((c) => [String(c.id), c.nombre])) }}
            value={categoriaId ? String(categoriaId) : 'todas'}
            onValueChange={(value) => {
              setCategoriaId(value === 'todas' ? undefined : Number(value));
              resetPagina();
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias?.map((categoria) => (
                <SelectItem key={categoria.id} value={String(categoria.id)}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 pb-1.5 text-sm">
          <Checkbox
            checked={soloStockBajo}
            onCheckedChange={(checked) => {
              setSoloStockBajo(Boolean(checked));
              resetPagina();
            }}
          />
          Solo stock bajo
        </label>
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
          icon={Package}
          title="No se pudo cargar el inventario"
          description="Ocurrió un problema al consultar las existencias. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={Package}
          title={hayFiltros ? 'Sin resultados' : 'Aún no hay existencias registradas'}
          description={
            hayFiltros
              ? 'No encontramos variantes que coincidan con tu búsqueda.'
              : 'Registra la primera entrada para empezar a llevar existencias.'
          }
          action={
            !hayFiltros && (
              <Button render={<Link to="registrar-entrada" />}>
                <PackagePlus />
                Registrar entrada
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl border">
            {isFetching && !isLoading && <SpinnerOverlay className="absolute inset-0 z-10 bg-background/70 py-0" />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Existencia</TableHead>
                  <TableHead className="text-right">Stock mínimo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((variante) => (
                  <TableRow key={variante.id} className="animate-in fade-in">
                    <TableCell>
                      <Link to={`variantes/${variante.id}`} className="font-medium transition-colors hover:underline">
                        {variante.producto.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>{variante.categoria.nombre}</TableCell>
                    <TableCell>{variante.unidad.abrevia}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ETIQUETA_ESTADO[variante.estado]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {variante.stockBajo && <AlertTriangle className="size-3.5 text-warning" />}
                        <span className={variante.stockBajo ? 'font-medium text-warning-foreground' : undefined}>
                          {variante.stockActual}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{variante.stockMinimo}</TableCell>
                    <TableCell className="text-right">
                      {variante.stockBajo && (
                        <Badge variant="destructive" className="bg-warning text-warning-foreground">
                          Stock bajo
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
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
