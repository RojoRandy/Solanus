import * as React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTurno, useTurnosDelDia } from './api';
import type { HorarioComida } from './types';
import { CapturaFolio } from './components/CapturaFolio';
import { ListaAsistencias } from './components/ListaAsistencias';
import { VoluntariosTurno } from './components/VoluntariosTurno';
import { MenuTurno } from './components/MenuTurno';
import { InsumosTurno } from './components/InsumosTurno';

const HORARIOS: { value: HorarioComida; label: string }[] = [
  { value: 'DESAYUNO', label: 'Desayuno' },
  { value: 'COMIDA', label: 'Comida' },
  { value: 'CENA', label: 'Cena' },
];

function horarioSugerido(): HorarioComida {
  const hora = new Date().getHours();
  if (hora < 11) return 'DESAYUNO';
  if (hora < 17) return 'COMIDA';
  return 'CENA';
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AsistenciaPage() {
  const [fecha, setFecha] = React.useState(hoyISO());
  const [horario, setHorario] = React.useState<HorarioComida>(horarioSugerido());

  const esHoy = fecha === hoyISO();
  const { data: turno, isLoading, isError } = useTurno(horario, esHoy ? undefined : fecha);
  const { data: resumenDia } = useTurnosDelDia(esHoy ? undefined : fecha);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Turno de comida</h1>
          <p className="text-muted-foreground">Captura de asistencia, voluntarios, menú e insumos del turno.</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="fecha-turno">Fecha</Label>
          <Input id="fecha-turno" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-44" />
        </div>
      </div>

      <Tabs value={horario} onValueChange={(v) => setHorario(v as HorarioComida)}>
        <TabsList>
          {HORARIOS.map((h) => {
            const resumen = resumenDia?.find((r) => r.horario === h.value);
            return (
              <TabsTrigger key={h.value} value={h.value} className="gap-2">
                {h.label}
                {resumen && resumen.totalAsistencias > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {resumen.totalAsistencias}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando turno…</p>}

      {isError && (
        <EmptyState
          icon={UtensilsCrossed}
          title="No se pudo cargar el turno"
          description="Revisa tu conexión e intenta de nuevo."
        />
      )}

      {turno && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <CapturaFolio turnoId={turno.id} />
            <ListaAsistencias turno={turno} />
          </div>
          <div className="flex flex-col gap-6">
            <MenuTurno key={turno.id} turno={turno} />
            <VoluntariosTurno turno={turno} />
            <InsumosTurno turnoId={turno.id} />
          </div>
        </div>
      )}
    </div>
  );
}
