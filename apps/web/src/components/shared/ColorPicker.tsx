import * as React from 'react';
import { Check } from 'lucide-react';
import { COLORES_EVENTO_PRESET } from '@comedor-solanus/shared';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  id?: string;
  disabled?: boolean;
}

/** Selector de color para etiquetas de eventos: presets rápidos + cualquier hex vía el input nativo del SO. */
export function ColorPicker({ value, onChange, id, disabled }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button id={id} type="button" variant="outline" disabled={disabled} className="w-full justify-start gap-2 font-normal" />
        }
      >
        <span className="size-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: value }} />
        <span className="font-mono uppercase">{value}</span>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid grid-cols-6 gap-2">
          {COLORES_EVENTO_PRESET.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              aria-label={preset.nombre}
              aria-pressed={value === preset.hex}
              className={cn(
                'flex size-8 items-center justify-center rounded-full border-2 border-transparent transition-shadow',
                value === preset.hex && 'ring-2 ring-ring ring-offset-2 ring-offset-popover',
              )}
              style={{ backgroundColor: preset.hex }}
              onClick={() => {
                onChange(preset.hex);
                setOpen(false);
              }}
            >
              {value === preset.hex && <Check className="size-4 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-2 border-t border-border pt-2.5">
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="size-8 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            aria-label="Color personalizado"
          />
          <span className="text-sm text-muted-foreground">Personalizado</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
