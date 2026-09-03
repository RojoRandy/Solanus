import * as React from 'react';
import { CalendarClock, UtensilsCrossed } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpinnerOverlay } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTurno, useTurnosDelDia } from './api';
import type { HorarioComida } from './types';
import { CapturaFolio } from './components/CapturaFolio';
import { ListaAsistencias } from './components/ListaAsistencias';
import { VoluntariosTurno } from './components/VoluntariosTurno';
import { MenuTurno } from './components/MenuTurno';
import { InsumosTurno } from './components/InsumosTurno';
import { SeleccionTurnoDialog } from './components/SeleccionTurnoDialog';

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

function formatFechaLarga(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function AsistenciaPage() {
  const [fecha, setFecha] = React.useState(hoyISO());
  const [horario, setHorario] = React.useState<HorarioComida>(horarioSugerido());
  // El turno solo se carga tras confirmar en el modal — GET /asistencia/turno
  // hace upsert, así que abrir la pantalla sin querer ya no crea un turno.
  const [confirmado, setConfirmado] = React.useState(false);

  const esHoy = fecha === hoyISO();
  const { data: turno, isLoading, isError } = useTurno(horario, esHoy ? undefined : fecha, { enabled: confirmado });
  const { data: resumenDia } = useTurnosDelDia(esHoy ? undefined : fecha, { enabled: confirmado });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <SeleccionTurnoDialog
        open={!confirmado}
        fecha={fecha}
        horario={horario}
        onFechaChange={setFecha}
        onHorarioChange={setHorario}
        onConfirmar={() => setConfirmado(true)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Turno de comida</h1>
          <p className="text-muted-foreground">Captura de asistencia, voluntarios, menú e insumos del turno.</p>
        </div>
        {confirmado && (
          <Button variant="outline" onClick={() => setConfirmado(false)}>
            <CalendarClock />
            {formatFechaLarga(fecha)}
          </Button>
        )}
      </div>

      {confirmado && (
        <>
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

          {isLoading && <SpinnerOverlay />}

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
                <CapturaFolio turno={turno} />
                <ListaAsistencias turno={turno} />
              </div>
              <div className="flex flex-col gap-6">
                <MenuTurno key={turno.id} turno={turno} />
                <VoluntariosTurno turno={turno} />
                <InsumosTurno turnoId={turno.id} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
