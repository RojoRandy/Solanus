import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useBienhechores, useEliminarBienhechor } from './api';
import type { Bienhechor } from './types';

export function BienhechoresListPage() {
  const { user } = useAuth();
  const esAdministrador = user?.rol === 'ADMINISTRADOR';
  const [buscar, setBuscar] = useState('');
  const { data: bienhechores, isLoading, isError, refetch } = useBienhechores({ buscar: buscar || undefined });
  const eliminar = useEliminarBienhechor();

  async function handleEliminar(bienhechor: Bienhechor) {
    try {
      await eliminar.mutateAsync(bienhechor.id);
      toast.success(`"${bienhechor.nombre}" se dio de baja`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja al bienhechor');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bienhechores</h1>
          <p className="text-sm text-muted-foreground">Personas y organizaciones que donan al comedor</p>
        </div>
        <Button render={<Link to="nuevo" />}>
          <Plus />
          Nuevo bienhechor
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={buscar}
          onChange={(event) => setBuscar(event.target.value)}
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
          icon={HandHeart}
          title="No se pudo cargar la lista"
          description="Ocurrió un problema al consultar los bienhechores. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && bienhechores && bienhechores.length === 0 && (
        <EmptyState
          icon={HandHeart}
          title={buscar ? 'Sin resultados' : 'Aún no hay bienhechores registrados'}
          description={
            buscar
              ? 'No encontramos bienhechores que coincidan con tu búsqueda.'
              : 'Da de alta al primer bienhechor para poder asociarlo a donaciones de inventario.'
          }
          action={
            !buscar && (
              <Button render={<Link to="nuevo" />}>
                <Plus />
                Nuevo bienhechor
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && bienhechores && bienhechores.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bienhechores.map((bienhechor) => (
                <TableRow key={bienhechor.id}>
                  <TableCell>
                    <Link to={String(bienhechor.id)} className="font-medium hover:underline">
                      {bienhechor.nombre}
                    </Link>
                    {!bienhechor.activo && (
                      <Badge variant="outline" className="ml-2">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{bienhechor.contacto ?? '—'}</TableCell>
                  <TableCell>{bienhechor.rfc ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {esAdministrador && bienhechor.activo && (
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
                          Dar de baja
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Dar de baja este bienhechor?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{bienhechor.nombre}&quot; dejará de aparecer como opción al registrar
                              donaciones. Su historial de lotes donados se conserva.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleEliminar(bienhechor)}>
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
      )}
    </div>
  );
}
