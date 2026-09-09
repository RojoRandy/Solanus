# Paso 4 — `ColorPicker` compartido

`apps/web/src/components/shared/ColorPicker.tsx` — junto a `EmptyState.tsx`.
No va en `components/ui/`: ese directorio es shadcn gestionado por CLI y shadcn
no trae un color picker.

## Props

```ts
interface ColorPickerProps {
  value: string; // hex #RRGGBB
  onChange: (hex: string) => void;
  id?: string;
  disabled?: boolean;
}
```

## Estructura

- Trigger: `Button variant="outline"` con un círculo de `value` (`span` redondo,
  `style={{ backgroundColor: value }}`, borde) + el hex en texto monoespaciado.
- Contenido en `Popover`/`PopoverContent` (`@/components/ui/popover`):
  - Grilla de los 6 swatches de `COLORES_EVENTO_PRESET` (de `@comedor-solanus/shared`):
    botones redondos (`size-8 rounded-full border-2`), `style={{ backgroundColor: hex }}`,
    `aria-label={nombre}`, `aria-pressed={value === hex}`, con un ícono `Check`
    superpuesto (blanco, con `mix-blend-difference` o simplemente `text-white
    drop-shadow` para que se vea sobre cualquier color) cuando está seleccionado.
  - Debajo, separador y fila «Personalizado»: `<input type="color" />` nativo
    (estilizado a `size-8 rounded-md border cursor-pointer`) + el hex actual en texto.
- Elegir un swatch llama a `onChange` y cierra el popover (`setOpen(false)`).
  El `<input type="color">` llama a `onChange` en `onInput` (actualización en vivo,
  sin cerrar el popover).

## Terminado cuando

- El picker funciona con teclado (los botones son `<button>`, foco visible por defecto).
- Elegir un preset y elegir un color personalizado ambos actualizan `value` y
  se reflejan en el trigger.
- `pnpm --filter web lint && pnpm --filter web typecheck` pasan.
