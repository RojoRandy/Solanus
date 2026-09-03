import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiError } from '@/lib/api-client';
import { useActualizarMovimiento, useMotivos } from '../api';
import type { Movimiento } from '../types';

interface EditarMovimientoDialogProps {
  movimiento: Movimiento | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Solo fecha, motivo y notas son editables — la cantidad se corrige con un
 * ajuste. El padre monta este componente con `key={movimiento?.id ?? 'cerrado'}`
 * para que el estado local arranque precargado sin necesitar un efecto.
 */
export function EditarMovimientoDialog({ movimiento, onOpenChange }: EditarMovimientoDialogProps) {
  const [fecha, setFecha] = React.useState<string | undefined>(movimiento?.fecha.slice(0, 10));
  const [motivoId, setMotivoId] = React.useState<number | undefined>(movimiento?.motivo.id);
  const [notas, setNotas] = React.useState(movimiento?.notas ?? '');

  const { data: motivos } = useMotivos();
  const actualizar = useActualizarMovimiento();

  function guardar() {
    if (!movimiento) return;
    actualizar.mutate(
      { id: movimiento.id, dto: { fecha, motivoId, notas: notas || undefined } },
      {
        onSuccess: () => {
          toast.success('Movimiento actualizado');
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar el movimiento'),
      },
    );
  }

  return (
    <Dialog open={movimiento !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Alert>
            <AlertDescription>Para corregir la cantidad registra un ajuste — la cantidad de un movimiento no se edita.</AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Label>Fecha</Label>
            <DatePicker value={fecha} onChange={setFecha} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Motivo</Label>
            <Select
              items={Object.fromEntries((motivos ?? []).map((m) => [String(m.id), m.nombre]))}
              value={motivoId ? String(motivoId) : undefined}
              onValueChange={(value) => setMotivoId(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {motivos?.map((motivo) => (
                  <SelectItem key={motivo.id} value={String(motivo.id)}>
                    {motivo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="editar-movimiento-notas">Notas</Label>
            <Textarea id="editar-movimiento-notas" value={notas} onChange={(event) => setNotas(event.target.value)} rows={3} />
          </div>
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
