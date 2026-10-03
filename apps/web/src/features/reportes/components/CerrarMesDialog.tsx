import * as React from 'react';
import { TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { ApiError } from '@/lib/api-client';
import { formatFechaCorta } from '@/features/inventario/format';
import { useCerrarMes } from '../api';
import { rangoDelMes, type Periodo } from '../periodo';

interface CerrarMesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodo: Periodo;
}

/**
 * Cierre de un periodo: deja en cero todas las existencias (un ajuste
 * "Cierre de mes" por lote) y bloquea movimientos con fecha dentro del rango.
 * El padre lo monta con `key` por periodo para precargar las fechas.
 */
export function CerrarMesDialog({ open, onOpenChange, periodo }: CerrarMesDialogProps) {
  const rango = rangoDelMes(periodo);
  const [desde, setDesde] = React.useState<string | undefined>(rango.desde);
  const [hasta, setHasta] = React.useState<string | undefined>(rango.hasta);
  const [confirmado, setConfirmado] = React.useState(false);
  const cerrarMes = useCerrarMes();

  function cerrar() {
    if (!desde || !hasta) {
      toast.error('Indica la fecha inicial y la final.');
      return;
    }
    if (desde > hasta) {
      toast.error('La fecha inicial no puede ser posterior a la final.');
      return;
    }
    cerrarMes.mutate(
      { desde, hasta },
      {
        onSuccess: (cierre) => {
          toast.success(`Periodo cerrado: ${cierre.lotesAjustados} lote(s) quedaron en cero.`);
          setConfirmado(false);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo cerrar el periodo.'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cerrar mes</DialogTitle>
          <DialogDescription>Indica el periodo que se está cerrando.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Fecha inicial</Label>
              <DatePicker value={desde} onChange={setDesde} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Fecha final</Label>
              <DatePicker value={hasta} onChange={setHasta} />
            </div>
          </div>
          <Alert variant="warning">
            <TriangleAlert />
            <AlertTitle>Esta acción no se puede deshacer</AlertTitle>
            <AlertDescription>
              Las existencias de todos los productos quedarán en cero (se registra un ajuste “Cierre de mes” por lote, fechado el{' '}
              {hasta ? formatFechaCorta(hasta) : 'último día'}) y ya no se podrán registrar ni editar movimientos dentro del periodo.
            </AlertDescription>
          </Alert>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={confirmado} onCheckedChange={(checked) => setConfirmado(Boolean(checked))} />
            Entiendo que las existencias quedarán en cero
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={cerrar} disabled={!confirmado || cerrarMes.isPending}>
            {cerrarMes.isPending ? 'Cerrando…' : 'Cerrar periodo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
