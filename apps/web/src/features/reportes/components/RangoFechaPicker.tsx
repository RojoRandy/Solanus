import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { RangoFecha } from '../types';

interface RangoFechaPickerProps {
  rango: RangoFecha;
  onChange: (rango: RangoFecha) => void;
}

/** El rango vacío ({}) es "el default del backend" (mes en curso a hoy) — restablecer solo lo vuelve a vaciar. */
export function RangoFechaPicker({ rango, onChange }: RangoFechaPickerProps) {
  const hayRango = Boolean(rango.desde || rango.hasta);

  return (
    <div className="flex items-end gap-2">
      <DateRangePicker value={rango} onChange={onChange} placeholder="Este mes hasta hoy" />
      {hayRango && (
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange({})} title="Restablecer periodo">
          <RotateCcw />
        </Button>
      )}
    </div>
  );
}
