import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useActualizarCfdiEntrada } from '../api';

interface AsignarCfdiDialogProps {
  /** Lote (entrada) al que se asigna el CFDI; `null` mantiene el diálogo cerrado. */
  lote: { numero: number; cfdi: string | null } | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * El CFDI se emite al bienhechor a fin de mes y aplica a todos los productos
 * del lote. El padre lo monta con `key` por lote para precargar sin efecto.
 */
export function AsignarCfdiDialog({ lote, onOpenChange }: AsignarCfdiDialogProps) {
  const [cfdi, setCfdi] = React.useState(lote?.cfdi ?? '');
  const actualizar = useActualizarCfdiEntrada();

  function guardar() {
    if (!lote) return;
    actualizar.mutate(
      { id: lote.numero, dto: { cfdi: cfdi.trim() || null } },
      {
        onSuccess: () => {
          toast.success(`CFDI guardado en el lote #${lote.numero}`);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el CFDI'),
      },
    );
  }

  return (
    <Dialog open={lote !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CFDI del lote #{lote?.numero}</DialogTitle>
          <DialogDescription>Se aplica a todos los productos del lote #{lote?.numero}.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="asignar-cfdi">CFDI (número de factura)</Label>
          <Input
            id="asignar-cfdi"
            value={cfdi}
            onChange={(event) => setCfdi(event.target.value)}
            placeholder="Déjalo vacío para quitarlo"
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={actualizar.isPending}>
            {actualizar.isPending ? 'Guardando…' : 'Guardar CFDI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
