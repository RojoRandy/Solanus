import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ComboboxField } from '@/features/inventario/ComboboxField';
import { useInventarioItems, useRegistrarEntrada } from '@/features/inventario/api';
import { useBienhechores } from '@/features/bienhechores/api';
import { ApiError } from '@/lib/api-client';

interface RegistrarDonativoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Atajo para registrar, sin salir de la pantalla del turno, un donativo recibido durante el servicio. */
export function RegistrarDonativoDialog({ open, onOpenChange }: RegistrarDonativoDialogProps) {
  const [itemId, setItemId] = React.useState<number>();
  const [bienhechorId, setBienhechorId] = React.useState<number>();
  const [cantidad, setCantidad] = React.useState('');

  const { data: items } = useInventarioItems();
  const { data: bienhechores } = useBienhechores();
  const registrarEntrada = useRegistrarEntrada();

  const opcionesProducto = (items ?? []).map((item) => ({ value: item.id, label: item.nombre }));
  const opcionesBienhechor = (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre }));

  function limpiar() {
    setItemId(undefined);
    setBienhechorId(undefined);
    setCantidad('');
  }

  function registrar() {
    const cantidadNum = Number(cantidad);
    if (!itemId || !bienhechorId || !cantidadNum || cantidadNum <= 0) {
      toast.error('Elige producto, bienhechor y una cantidad válida.');
      return;
    }
    registrarEntrada.mutate(
      { itemId, cantidadInicial: cantidadNum, origen: 'DONADO', bienhechorId },
      {
        onSuccess: () => {
          toast.success('Donativo registrado en el inventario.');
          limpiar();
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el donativo.'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar donativo recibido</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Producto</Label>
            <ComboboxField options={opcionesProducto} value={itemId} onValueChange={setItemId} placeholder="Producto…" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bienhechor</Label>
            <ComboboxField options={opcionesBienhechor} value={bienhechorId} onValueChange={setBienhechorId} placeholder="¿Quién donó?" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cantidad-donativo">Cantidad</Label>
            <Input id="cantidad-donativo" type="number" min={0} step="0.001" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={registrar} disabled={registrarEntrada.isPending}>
            {registrarEntrada.isPending ? 'Guardando…' : 'Registrar donativo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
