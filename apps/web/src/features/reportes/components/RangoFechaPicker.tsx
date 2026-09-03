import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RangoFecha } from '../types';

interface RangoFechaPickerProps {
  rango: RangoFecha;
  onChange: (rango: RangoFecha) => void;
}

export function RangoFechaPicker({ rango, onChange }: RangoFechaPickerProps) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="reporte-desde">Desde</Label>
        <Input
          id="reporte-desde"
          type="date"
          value={rango.desde ?? ''}
          onChange={(e) => onChange({ ...rango, desde: e.target.value || undefined })}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="reporte-hasta">Hasta</Label>
        <Input
          id="reporte-hasta"
          type="date"
          value={rango.hasta ?? ''}
          onChange={(e) => onChange({ ...rango, hasta: e.target.value || undefined })}
          className="w-40"
        />
      </div>
    </div>
  );
}
