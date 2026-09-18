import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useActualizarUnidad } from '@/features/inventario/api';
import type { UnidadRef } from '@/features/inventario/types';

interface EditarUnidadDialogProps {
  unidad: UnidadRef | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * El padre monta este componente con `key={unidad?.id ?? 'cerrado'}` — al
 * cambiar de unidad, React lo remonta desde cero en vez de reutilizar la
 * instancia, así el estado local arranca precargado sin necesitar un efecto.
 */
export function EditarUnidadDialog({ unidad, onOpenChange }: EditarUnidadDialogProps) {
  const [nombre, setNombre] = React.useState(unidad?.nombre ?? '');
  const [abrevia, setAbrevia] = React.useState(unidad?.abrevia ?? '');
  const [indicarContenido, setIndicarContenido] = React.useState(unidad?.indicarContenido ?? false);
  const actualizar = useActualizarUnidad();

  function guardar() {
    if (!unidad) return;
    actualizar.mutate(
      { id: unidad.id, dto: { nombre, abrevia, indicarContenido } },
      {
        onSuccess: () => {
          toast.success('Unidad actualizada');
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar la unidad'),
      },
    );
  }

  return (
    <Dialog open={unidad !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar unidad de medida</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="editar-unidad-nombre">Nombre</Label>
            <Input id="editar-unidad-nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="editar-unidad-abrevia">Abreviatura</Label>
            <Input id="editar-unidad-abrevia" value={abrevia} onChange={(event) => setAbrevia(event.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={indicarContenido}
              onCheckedChange={(checked) => setIndicarContenido(Boolean(checked))}
              aria-describedby="editar-unidad-contenido-ayuda"
            />
            Indicar contenido
          </label>
          <p id="editar-unidad-contenido-ayuda" className="text-sm text-muted-foreground">
            La unidad es un envase: al dar de alta un producto se pedirá cuánto trae dentro.
          </p>
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
