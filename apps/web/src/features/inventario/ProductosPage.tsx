import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Package, PackagePlus, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useEliminarInventarioItem, useInventarioItems } from './api';
import type { InventarioItem } from './types';

export function ProductosPage() {
  const { user } = useAuth();
  const esAdministrador = user?.rol === 'ADMINISTRADOR';
  const [buscar, setBuscar] = useState('');
  const { data: items, isLoading, isError, refetch } = useInventarioItems({ buscar: buscar || undefined });
  const eliminarItem = useEliminarInventarioItem();

  async function handleEliminar(item: InventarioItem) {
    try {
      await eliminarItem.mutateAsync(item.id);
      toast.success(`"${item.nombre}" se dio de baja del catálogo`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja el producto');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">Catálogo de productos y existencia disponible</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link to="movimientos" />}>
            <ClipboardList />
            Movimientos
          </Button>
          <Button variant="outline" render={<Link to="registrar-entrada" />}>
            <PackagePlus />
            Registrar entrada
          </Button>
          <Button render={<Link to="nuevo" />}>
            <Plus />
            Nuevo producto
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={buscar}
          onChange={(event) => setBuscar(event.target.value)}
          placeholder="Buscar por nombre o marca…"
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
          description="Ocurrió un problema al consultar el inventario. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && items && items.length === 0 && (
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

      {!isLoading && !isError && items && items.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Existencia</TableHead>
                <TableHead className="text-right">Stock mínimo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link to={String(item.id)} className="font-medium hover:underline">
                      {item.nombre}
                    </Link>
                    {item.marca && <p className="text-xs text-muted-foreground">{item.marca}</p>}
                  </TableCell>
                  <TableCell>{item.categoria.nombre}</TableCell>
                  <TableCell>{item.unidad.abrevia}</TableCell>
                  <TableCell>{item.ubicacion?.nombre ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.stockBajo && <AlertTriangle className="size-3.5 text-warning" />}
                      <span className={item.stockBajo ? 'font-medium text-warning-foreground' : undefined}>
                        {item.stockActual}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.stockMinimo}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.stockBajo && (
                        <Badge variant="destructive" className="bg-warning text-warning-foreground">
                          Stock bajo
                        </Badge>
                      )}
                      {esAdministrador && (
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                            Dar de baja
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Dar de baja este producto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{item.nombre}&quot; dejará de aparecer en el catálogo activo. Su historial de
                                lotes y movimientos se conserva.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void handleEliminar(item)}>
                                Dar de baja
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
