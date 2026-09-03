import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useCrearUnidad } from '../api';
import type { UnidadRef } from '../types';

interface NuevaUnidadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreada: (unidad: UnidadRef) => void;
}

/** Alta rápida de unidad de medida sin salir de la pantalla — Registrar entrada, donativos y Configuración. */
export function NuevaUnidadDialog({ open, onOpenChange, onCreada }: NuevaUnidadDialogProps) {
  const [nombre, setNombre] = React.useState('');
  const [abrevia, setAbrevia] = React.useState('');
  const crear = useCrearUnidad();

  function limpiar() {
    setNombre('');
    setAbrevia('');
  }

  function registrar() {
    if (!nombre.trim() || !abrevia.trim()) {
      toast.error('Indica nombre y abreviatura de la unidad.');
      return;
    }
    crear.mutate(
      { nombre: nombre.trim(), abrevia: abrevia.trim() },
      {
        onSuccess: (unidad) => {
          toast.success(`Unidad "${unidad.nombre}" creada.`);
          limpiar();
          onCreada(unidad);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo crear la unidad.'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva unidad de medida</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nueva-unidad-nombre">Nombre</Label>
            <Input id="nueva-unidad-nombre" autoFocus value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Kilogramo" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nueva-unidad-abrevia">Abreviatura</Label>
            <Input id="nueva-unidad-abrevia" value={abrevia} onChange={(event) => setAbrevia(event.target.value)} placeholder="kg" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={registrar} disabled={crear.isPending}>
            {crear.isPending ? 'Guardando…' : 'Crear unidad'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
