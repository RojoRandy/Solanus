import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api-client';
import { useAsignarCfdiMovimientos } from '../api';
import type { Movimiento } from '../types';

interface AsignarCfdiDialogProps {
  /** Movimientos (mismo bienhechor) cuyos lotes reciben el CFDI; `null` mantiene el diálogo cerrado. */
  movimientos: Movimiento[] | null;
  onOpenChange: (open: boolean) => void;
  onGuardado?: () => void;
}

/**
 * El CFDI se emite al bienhechor a fin de mes y aplica a todos los productos
 * de cada lote. El padre lo monta con `key` por selección para precargar sin efecto.
 */
export function AsignarCfdiDialog({ movimientos, onOpenChange, onGuardado }: AsignarCfdiDialogProps) {
  const lotes = [...new Set((movimientos ?? []).flatMap((m) => (m.lote ? [m.lote.numero] : [])))];
  const cfdis = new Set((movimientos ?? []).map((m) => m.lote?.cfdi ?? ''));
  const [cfdi, setCfdi] = React.useState(cfdis.size === 1 ? [...cfdis][0] : '');
  const asignar = useAsignarCfdiMovimientos();
  const etiquetaLotes = lotes.map((numero) => `#${numero}`).join(', ');

  function guardar() {
    if (!movimientos) return;
    asignar.mutate(
      { movimientoIds: movimientos.map((m) => m.id), cfdi: cfdi.trim() || null },
      {
        onSuccess: () => {
          toast.success(lotes.length === 1 ? `CFDI guardado en el lote ${etiquetaLotes}` : `CFDI guardado en ${lotes.length} lotes`);
          onGuardado?.();
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el CFDI'),
      },
    );
  }

  return (
    <Dialog open={movimientos !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lotes.length === 1 ? `CFDI del lote ${etiquetaLotes}` : `CFDI de ${lotes.length} lotes`}</DialogTitle>
          <DialogDescription>
            Se aplica a todos los productos {lotes.length === 1 ? 'del lote' : 'de los lotes'} {etiquetaLotes}.
          </DialogDescription>
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
          <Button onClick={guardar} disabled={asignar.isPending}>
            {asignar.isPending ? 'Guardando…' : 'Guardar CFDI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
