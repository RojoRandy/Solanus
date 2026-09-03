import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useReporteAsistencia } from '../api';
import type { RangoFecha } from '../types';

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function ReporteAsistenciaView({ rango }: { rango: RangoFecha }) {
  const { data, isLoading } = useReporteAsistencia(rango);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!data) return null;

  const maxDia = Math.max(1, ...data.porDia.map((d) => d.total));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-primary">{data.totalAsistencias}</span>
            <span className="text-sm text-muted-foreground">Total del periodo</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.desayuno}</span>
            <span className="text-sm text-muted-foreground">Desayuno</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.comida}</span>
            <span className="text-sm text-muted-foreground">Comida</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.cena}</span>
            <span className="text-sm text-muted-foreground">Cena</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia por día</CardTitle>
        </CardHeader>
        <CardContent>
          {data.porDia.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="Sin asistencias en este periodo" />
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.porDia.map((dia) => (
                <div key={dia.fecha} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm capitalize text-muted-foreground">{formatFecha(dia.fecha)}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                    <div className="h-full rounded bg-primary" style={{ width: `${(dia.total / maxDia) * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-medium">{dia.total}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
