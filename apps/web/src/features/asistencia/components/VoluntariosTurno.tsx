import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HeartHandshake, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ComboboxField } from '@/features/inventario/ComboboxField';
import { voluntariosApi, resolveFotoUrl } from '@/features/voluntarios/api';
import { ApiError } from '@/lib/api-client';
import { useAsignarVoluntario, useQuitarVoluntario } from '../api';
import type { Turno } from '../types';

function iniciales(nombres: string, apellidos: string): string {
  return `${nombres[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase();
}

export function VoluntariosTurno({ turno }: { turno: Turno }) {
  const { data: voluntarios } = useQuery({
    queryKey: ['voluntarios', 'lista', { activo: 'true' as const }],
    queryFn: () => voluntariosApi.listar({ activo: 'true' }),
  });
  const asignar = useAsignarVoluntario();
  const quitar = useQuitarVoluntario();

  const yaAsignadosIds = new Set(turno.voluntarios.map((tv) => tv.voluntario.id));
  const opciones = (voluntarios ?? [])
    .filter((v) => !yaAsignadosIds.has(v.id))
    .map((v) => ({ value: v.id, label: `${v.nombres} ${v.apellidos}` }));

  function agregar(voluntarioId: number | undefined) {
    if (!voluntarioId) return;
    asignar.mutate(
      { turnoId: turno.id, voluntarioId },
      { onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo asignar el voluntario.') },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voluntarios del turno</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ComboboxField options={opciones} value={undefined} onValueChange={agregar} placeholder="Agregar voluntario…" />

        {turno.voluntarios.length === 0 ? (
          <EmptyState icon={HeartHandshake} title="Sin voluntarios asignados" className="py-8" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {turno.voluntarios.map((tv) => (
              <div key={tv.id} className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1.5 pr-2.5">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={resolveFotoUrl(tv.voluntario.fotoPath)} />
                  <AvatarFallback className="text-[10px]">{iniciales(tv.voluntario.nombres, tv.voluntario.apellidos)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {tv.voluntario.nombres} {tv.voluntario.apellidos}
                </span>
                <button
                  type="button"
                  aria-label="Quitar voluntario"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    quitar.mutate(
                      { turnoId: turno.id, voluntarioId: tv.voluntario.id },
                      { onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo quitar el voluntario.') },
                    )
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
