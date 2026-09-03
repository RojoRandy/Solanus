import { useState } from 'react';
import { Pencil, Plus, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { ApiError } from '@/lib/api-client';
import { useEliminarUnidad, useUnidades } from '@/features/inventario/api';
import { NuevaUnidadDialog } from '@/features/inventario/components/NuevaUnidadDialog';
import type { UnidadRef } from '@/features/inventario/types';
import { EditarUnidadDialog } from './EditarUnidadDialog';

export function UnidadesTab() {
  const { data: unidades, isLoading } = useUnidades();
  const eliminar = useEliminarUnidad();
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const [unidadEditar, setUnidadEditar] = useState<UnidadRef | null>(null);

  async function handleEliminar(unidad: UnidadRef) {
    try {
      await eliminar.mutateAsync(unidad.id);
      toast.success(`Unidad "${unidad.nombre}" dada de baja`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja la unidad — puede estar en uso');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setNuevaAbierta(true)}>
          <Plus />
          Nueva unidad
        </Button>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && (!unidades || unidades.length === 0) && (
        <EmptyState icon={Ruler} title="Sin unidades registradas" />
      )}

      {!isLoading && unidades && unidades.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Abreviatura</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {unidades.map((unidad) => (
                <TableRow key={unidad.id}>
                  <TableCell className="font-medium">{unidad.nombre}</TableCell>
                  <TableCell>{unidad.abrevia}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setUnidadEditar(unidad)} title="Editar">
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>Dar de baja</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Dar de baja esta unidad?</AlertDialogTitle>
                            <AlertDialogDescription>
                              No podrá usarse en nuevas entradas. Si ya tiene variantes de inventario asociadas, no se podrá dar de baja.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleEliminar(unidad)}>Dar de baja</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NuevaUnidadDialog open={nuevaAbierta} onOpenChange={setNuevaAbierta} onCreada={() => undefined} />
      <EditarUnidadDialog key={unidadEditar?.id ?? 'cerrado'} unidad={unidadEditar} onOpenChange={(open) => !open && setUnidadEditar(null)} />
    </div>
  );
}
