import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
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
import { useDebouncedValue } from '@/features/voluntarios/use-debounced-value';
import { usePaginacion } from '@/lib/pagination';
import { useEliminarProducto, useProductos } from './api';
import type { Producto } from './types';

export function ProductosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const esAdministrador = user?.rol === 'ADMINISTRADOR';
  const [buscarInput, setBuscarInput] = useState('');
  const buscar = useDebouncedValue(buscarInput.trim(), 300);
  const { page, limit, setPage, resetPagina } = usePaginacion();

  const { data, isLoading, isFetching, isError, refetch } = useProductos({ buscar: buscar || undefined, page, limit });
  const eliminarProducto = useEliminarProducto();

  async function handleEliminar(producto: Producto) {
    try {
      await eliminarProducto.mutateAsync(producto.id);
      toast.success(`"${producto.nombre}" se dio de baja del catálogo`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja el producto');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Catálogo de productos</h1>
            <p className="text-sm text-muted-foreground">Nombre y categoría — marca, unidad y presentación se capturan en cada entrada</p>
          </div>
        </div>
        <Button render={<Link to="nuevo" />}>
          <Plus />
          Nuevo producto
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={buscarInput}
          onChange={(event) => {
            setBuscarInput(event.target.value);
            resetPagina();
          }}
          placeholder="Buscar por nombre…"
          className="pl-8"
        />
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
          title="No se pudo cargar el catálogo"
          description="Ocurrió un problema al consultar los productos. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={Package}
          title={buscar ? 'Sin resultados' : 'Aún no hay productos registrados'}
          description={
            buscar
              ? 'No encontramos productos que coincidan con tu búsqueda.'
              : 'Da de alta el primer producto del catálogo o registra una entrada.'
          }
          action={
            !buscar && (
              <Button render={<Link to="nuevo" />}>
                <Plus />
                Nuevo producto
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
                  <TableHead>Estado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((producto) => (
                  <TableRow key={producto.id} className="animate-in fade-in">
                    <TableCell>
                      <Link to={String(producto.id)} className="font-medium transition-colors hover:underline">
                        {producto.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>{producto.categoria.nombre}</TableCell>
                    <TableCell>
                      {producto.activo ? <Badge variant="secondary">Activo</Badge> : <Badge variant="outline">Dado de baja</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      {esAdministrador && producto.activo && (
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                            Dar de baja
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Dar de baja este producto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{producto.nombre}&quot; dejará de aparecer en el catálogo activo. Su historial de
                                variantes, lotes y movimientos se conserva.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void handleEliminar(producto)}>
                                Dar de baja
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
