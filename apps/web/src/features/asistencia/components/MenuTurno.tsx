import * as React from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { useActualizarTurno } from '../api';
import type { Turno } from '../types';

/**
 * El padre monta este componente con `key={turno.id}` — al cambiar de turno,
 * React lo remonta desde cero en vez de reutilizar la instancia, así el estado
 * local del borrador siempre arranca limpio sin necesitar un efecto para
 * sincronizarlo manualmente.
 */
export function MenuTurno({ turno }: { turno: Turno }) {
  const [menu, setMenu] = React.useState(turno.menu ?? '');
  const actualizar = useActualizarTurno();

  const cambioSinGuardar = menu !== (turno.menu ?? '');

  function guardar() {
    actualizar.mutate(
      { turnoId: turno.id, menu },
      {
        onSuccess: () => toast.success('Menú actualizado.'),
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el menú.'),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menú del día</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          placeholder="Ej. Arroz, frijoles, tortillas, agua de horchata…"
          rows={3}
        />
        {cambioSinGuardar && (
          <Button size="sm" className="self-end" onClick={guardar} disabled={actualizar.isPending}>
            {actualizar.isPending ? 'Guardando…' : 'Guardar menú'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
