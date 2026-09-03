import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useCrearCategoria } from '../api';
import type { CategoriaRef } from '../types';

interface NuevaCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreada: (categoria: CategoriaRef) => void;
}

/** Alta rápida de categoría sin salir de la pantalla — usado en Registrar entrada, donativos y Configuración. */
export function NuevaCategoriaDialog({ open, onOpenChange, onCreada }: NuevaCategoriaDialogProps) {
  const [nombre, setNombre] = React.useState('');
  const crear = useCrearCategoria();

  function registrar() {
    if (!nombre.trim()) {
      toast.error('Indica el nombre de la categoría.');
      return;
    }
    crear.mutate(
      { nombre: nombre.trim() },
      {
        onSuccess: (categoria) => {
          toast.success(`Categoría "${categoria.nombre}" creada.`);
          setNombre('');
          onCreada(categoria);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo crear la categoría.'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="nueva-categoria-nombre">Nombre</Label>
          <Input
            id="nueva-categoria-nombre"
            autoFocus
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Enlatados"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={registrar} disabled={crear.isPending}>
            {crear.isPending ? 'Guardando…' : 'Crear categoría'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
