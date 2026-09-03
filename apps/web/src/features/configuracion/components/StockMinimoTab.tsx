import { useState } from 'react';
import { Boxes, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SpinnerOverlay } from '@/components/ui/spinner';
import { PaginationControls } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api-client';
import { useDebouncedValue } from '@/features/voluntarios/use-debounced-value';
import { usePaginacion } from '@/lib/pagination';
import { useActualizarVariante, useCategorias, useVariantes } from '@/features/inventario/api';
import { ETIQUETA_ESTADO } from '@/features/inventario/types';

export function StockMinimoTab() {
  const [buscarInput, setBuscarInput] = useState('');
  const buscar = useDebouncedValue(buscarInput.trim(), 300);
  const [categoriaId, setCategoriaId] = useState<number>();
  const { page, limit, setPage, resetPagina } = usePaginacion();

  const { data: categorias } = useCategorias();
  const { data, isLoading, isFetching } = useVariantes({ buscar: buscar || undefined, categoriaId, page, limit });
  const actualizar = useActualizarVariante();

  function guardarMinimo(varianteId: number, valor: string) {
    const numero = Number(valor);
    if (Number.isNaN(numero) || numero < 0) return;
    actualizar.mutate(
      { id: varianteId, dto: { stockMinimo: numero } },
      {
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar el stock mínimo'),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
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

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && data && data.items.length === 0 && (
        <EmptyState icon={Boxes} title="Sin variantes de inventario" description="Se crean automáticamente al registrar la primera entrada de un producto." />
      )}

      {!isLoading && data && data.items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl border">
            {isFetching && !isLoading && <SpinnerOverlay className="absolute inset-0 z-10 bg-background/70 py-0" />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Existencia</TableHead>
                  <TableHead className="text-right">Stock mínimo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((variante) => (
                  <TableRow key={variante.id}>
                    <TableCell className="font-medium">{variante.producto.nombre}</TableCell>
                    <TableCell>{variante.unidad.abrevia}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ETIQUETA_ESTADO[variante.estado]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{variante.stockActual}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        defaultValue={variante.stockMinimo}
                        onBlur={(event) => guardarMinimo(variante.id, event.target.value)}
                        className="ml-auto w-24 text-right"
                      />
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
