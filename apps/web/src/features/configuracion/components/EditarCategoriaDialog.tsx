import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useActualizarCategoria } from '@/features/inventario/api';
import type { CategoriaRef } from '@/features/inventario/types';

interface EditarCategoriaDialogProps {
  categoria: CategoriaRef | null;
  onOpenChange: (open: boolean) => void;
}

/** El padre monta este componente con `key={categoria?.id ?? 'cerrado'}`, ver EditarUnidadDialog. */
export function EditarCategoriaDialog({ categoria, onOpenChange }: EditarCategoriaDialogProps) {
  const [nombre, setNombre] = React.useState(categoria?.nombre ?? '');
  const actualizar = useActualizarCategoria();

  function guardar() {
    if (!categoria) return;
    actualizar.mutate(
      { id: categoria.id, dto: { nombre } },
      {
        onSuccess: () => {
          toast.success('Categoría actualizada');
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar la categoría'),
      },
    );
  }

  return (
    <Dialog open={categoria !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="editar-categoria-nombre">Nombre</Label>
          <Input id="editar-categoria-nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={actualizar.isPending}>
            {actualizar.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
