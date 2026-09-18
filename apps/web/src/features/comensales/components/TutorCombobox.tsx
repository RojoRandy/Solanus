import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useTutores } from '../api';

interface TutorOption {
  value: number;
  label: string;
}

interface TutorComboboxProps {
  value: number | null | undefined;
  onChange: (tutorId: number | null) => void;
  /** Se excluye del listado — el propio comensal no puede ser su tutor. */
  excluirComensalId?: number;
  disabled?: boolean;
}

/** Combobox de búsqueda de tutor: ofrece comensales activos, mayores de edad y sin tutor propio. */
export function TutorCombobox({
  value,
  onChange,
  excluirComensalId,
  disabled,
}: TutorComboboxProps) {
  const { data, isLoading } = useTutores();

  const opciones: TutorOption[] = (data ?? [])
    .filter((c) => c.id !== excluirComensalId)
    .map((c) => ({
      value: c.id,
      label: `${c.nombres} ${c.apellidos} — folio ${c.folio}`,
    }));

  const seleccionado = opciones.find((o) => o.value === value) ?? null;

  return (
    <Combobox<TutorOption>
      items={opciones}
      value={seleccionado}
      onValueChange={(item) => onChange(item ? item.value : null)}
      itemToStringLabel={(item) => item.label}
      disabled={disabled || isLoading}
    >
      <ComboboxInput placeholder="Buscar tutor por nombre o folio..." />
      <ComboboxContent>
        <ComboboxEmpty>
          {isLoading ? 'Cargando tutores...' : 'No se encontraron tutores disponibles.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: TutorOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
