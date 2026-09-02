import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export interface ComboboxOption {
  value: number;
  label: string;
}

interface ComboboxFieldProps {
  options: ComboboxOption[];
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  placeholder?: string;
  emptyText?: string;
}

/** Selector con búsqueda por nombre, reutilizado para elegir producto y bienhechor en los formularios de inventario. */
export function ComboboxField({
  options,
  value,
  onValueChange,
  placeholder = 'Buscar…',
  emptyText = 'Sin resultados',
}: ComboboxFieldProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option) => onValueChange(option ? (option as ComboboxOption).value : undefined)}
      itemToStringLabel={(option: ComboboxOption) => option.label}
    >
      <ComboboxInput placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(option: ComboboxOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
