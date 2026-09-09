import { toast } from 'sonner';
import { HandCoins, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginationControls } from '@/components/ui/pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatFechaCorta, formatMoneda } from '@/features/inventario/format';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { usePaginacion } from '@/lib/pagination';
import { useDonativosDinero, useEliminarDonativoDinero } from '../api';
import { ETIQUETA_METODO_PAGO } from '../types';

interface HistorialDonativosProps {
  bienhechorId?: number;
  desde?: string;
  hasta?: string;
  /** Agrega la columna Bienhechor — para la vista sin un bienhechor fijo (reportes). */
  mostrarBienhechor?: boolean;
}

export function HistorialDonativos({ bienhechorId, desde, hasta, mostrarBienhechor }: HistorialDonativosProps) {
  const { user } = useAuth();
  const esAdministrador = user?.rol === 'ADMINISTRADOR';
  const { page, limit, setPage } = usePaginacion(10);

  const { data, isLoading } = useDonativosDinero({ bienhechorId, desde, hasta, page, limit });
  const eliminar = useEliminarDonativoDinero();

  function handleEliminar(id: number) {
    eliminar.mutate(id, {
      onSuccess: () => toast.success('Donativo eliminado.'),
      onError: (error) =>
        toast.error(error instanceof ApiError ? error.message : 'No se pudo eliminar el donativo.'),
    });
  }

  const donativos = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Donativos en dinero</CardTitle>
        {data && data.totalMonto > 0 && (
          <span className="text-sm text-muted-foreground">
            Total donado: <span className="font-medium text-foreground">{formatMoneda(data.totalMonto)}</span>
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : donativos.length === 0 ? (
          <EmptyState icon={HandCoins} title="Sin donativos en dinero registrados" className="py-6" />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    {mostrarBienhechor && <TableHead>Bienhechor</TableHead>}
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Folio</TableHead>
                    <TableHead>Registró</TableHead>
                    {esAdministrador && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donativos.map((donativo) => (
                    <TableRow key={donativo.id}>
                      <TableCell>{formatFechaCorta(donativo.fecha)}</TableCell>
                      {mostrarBienhechor && <TableCell>{donativo.bienhechor.nombre}</TableCell>}
                      <TableCell className="text-right font-medium">{formatMoneda(donativo.monto)}</TableCell>
                      <TableCell>{ETIQUETA_METODO_PAGO[donativo.metodoPago]}</TableCell>
                      <TableCell className="text-muted-foreground">{donativo.folioRecibo ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{donativo.registradoPor.nombre}</TableCell>
                      {esAdministrador && (
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                              <Trash2 className="size-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este donativo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se borrará el registro de {formatMoneda(donativo.monto)} del{' '}
                                  {formatFechaCorta(donativo.fecha)}. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleEliminar(donativo.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls meta={data?.meta} onPageChange={setPage} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
