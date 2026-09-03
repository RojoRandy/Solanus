import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useCrearBienhechor } from '../api';
import type { Bienhechor } from '../types';

interface NuevoBienhechorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreado: (bienhechor: Bienhechor) => void;
}

/** Alta rápida de bienhechor sin salir de la pantalla — turno de comida, donativos y registrar entrada. */
export function NuevoBienhechorDialog({ open, onOpenChange, onCreado }: NuevoBienhechorDialogProps) {
  const [nombre, setNombre] = React.useState('');
  const [contacto, setContacto] = React.useState('');
  const crear = useCrearBienhechor();

  function limpiar() {
    setNombre('');
    setContacto('');
  }

  function registrar() {
    if (!nombre.trim()) {
      toast.error('Indica el nombre del bienhechor.');
      return;
    }
    crear.mutate(
      { nombre: nombre.trim(), contacto: contacto.trim() || undefined },
      {
        onSuccess: (bienhechor) => {
          toast.success(`Bienhechor "${bienhechor.nombre}" registrado.`);
          limpiar();
          onCreado(bienhechor);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el bienhechor.'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo bienhechor</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nuevo-bienhechor-nombre">Nombre</Label>
            <Input id="nuevo-bienhechor-nombre" autoFocus value={nombre} onChange={(event) => setNombre(event.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nuevo-bienhechor-contacto">Contacto</Label>
            <Input id="nuevo-bienhechor-contacto" value={contacto} onChange={(event) => setContacto(event.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={registrar} disabled={crear.isPending}>
            {crear.isPending ? 'Guardando…' : 'Registrar bienhechor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
