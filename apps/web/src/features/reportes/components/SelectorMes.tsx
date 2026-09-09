import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mesAnterior, mesSiguiente, periodoActual, type Periodo } from '../periodo';

const NOMBRES_MES = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date(2000, i, 1)),
);

const ANIO_ACTUAL = periodoActual().anio;
const ANIOS = Array.from({ length: 4 }, (_, i) => ANIO_ACTUAL - 3 + i);

interface SelectorMesProps {
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
}

/** Selector de mes/año con flechas para pasar al mes anterior/siguiente. */
export function SelectorMes({ periodo, onChange }: SelectorMesProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="ghost" size="icon" onClick={() => onChange(mesAnterior(periodo))} title="Mes anterior">
        <ChevronLeft />
      </Button>

      <Select
        items={Object.fromEntries(NOMBRES_MES.map((nombre, i) => [String(i + 1), nombre]))}
        value={String(periodo.mes)}
        onValueChange={(value) => onChange({ ...periodo, mes: Number(value) })}
      >
        <SelectTrigger className="w-36 capitalize">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NOMBRES_MES.map((nombre, i) => (
            <SelectItem key={nombre} value={String(i + 1)} className="capitalize">
              {nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={Object.fromEntries(ANIOS.map((anio) => [String(anio), String(anio)]))}
        value={String(periodo.anio)}
        onValueChange={(value) => onChange({ ...periodo, anio: Number(value) })}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ANIOS.map((anio) => (
            <SelectItem key={anio} value={String(anio)}>
              {anio}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={() => onChange(mesSiguiente(periodo))} title="Mes siguiente">
        <ChevronRight />
      </Button>
    </div>
  );
}
