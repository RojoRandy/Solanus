import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HorarioComida } from '../types';

const HORARIOS: { value: HorarioComida; label: string }[] = [
  { value: 'DESAYUNO', label: 'Desayuno' },
  { value: 'COMIDA', label: 'Comida' },
  { value: 'CENA', label: 'Cena' },
];

interface SeleccionTurnoDialogProps {
  open: boolean;
  fecha: string;
  horario: HorarioComida;
  onFechaChange: (fecha: string) => void;
  onHorarioChange: (horario: HorarioComida) => void;
  onConfirmar: () => void;
}

/**
 * Modal de apertura de turno: obliga a confirmar fecha y horario antes de
 * cargar el turno — evita crear turnos por accidente al solo entrar a la
 * pantalla (el GET /asistencia/turno hace upsert). Sin estado propio: los
 * campos están ligados directamente al estado del padre.
 */
export function SeleccionTurnoDialog({ open, fecha, horario, onFechaChange, onHorarioChange, onConfirmar }: SeleccionTurnoDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Turno de comida</DialogTitle>
          <DialogDescription>Confirma la fecha y el horario antes de empezar a capturar.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Fecha</Label>
            <DatePicker value={fecha} onChange={(value) => value && onFechaChange(value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Horario</Label>
            <Select
              items={Object.fromEntries(HORARIOS.map((h) => [h.value, h.label]))}
              value={horario}
              onValueChange={(value) => onHorarioChange(value as HorarioComida)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORARIOS.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onConfirmar}>Empezar captura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
