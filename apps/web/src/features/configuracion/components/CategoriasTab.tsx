import { useState } from 'react';
import { FolderTree, Pencil, Plus } from 'lucide-react';
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
import { useCategorias, useEliminarCategoria } from '@/features/inventario/api';
import { NuevaCategoriaDialog } from '@/features/inventario/components/NuevaCategoriaDialog';
import type { CategoriaRef } from '@/features/inventario/types';
import { EditarCategoriaDialog } from './EditarCategoriaDialog';

export function CategoriasTab() {
  const { data: categorias, isLoading } = useCategorias();
  const eliminar = useEliminarCategoria();
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaRef | null>(null);

  async function handleEliminar(categoria: CategoriaRef) {
    try {
      await eliminar.mutateAsync(categoria.id);
      toast.success(`Categoría "${categoria.nombre}" dada de baja`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo dar de baja la categoría — puede estar en uso');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setNuevaAbierta(true)}>
          <Plus />
          Nueva categoría
        </Button>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && (!categorias || categorias.length === 0) && (
        <EmptyState icon={FolderTree} title="Sin categorías registradas" />
      )}

      {!isLoading && categorias && categorias.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="font-medium">{categoria.nombre}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setCategoriaEditar(categoria)} title="Editar">
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>Dar de baja</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Dar de baja esta categoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                              No podrá usarse en nuevos productos. Si ya tiene productos asociados, no se podrá dar de baja.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleEliminar(categoria)}>Dar de baja</AlertDialogAction>
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

      <NuevaCategoriaDialog open={nuevaAbierta} onOpenChange={setNuevaAbierta} onCreada={() => undefined} />
      <EditarCategoriaDialog key={categoriaEditar?.id ?? 'cerrado'} categoria={categoriaEditar} onOpenChange={(open) => !open && setCategoriaEditar(null)} />
    </div>
  );
}
