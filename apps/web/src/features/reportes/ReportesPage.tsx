import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RangoFechaPicker } from './components/RangoFechaPicker';
import { ReporteAsistenciaView } from './components/ReporteAsistenciaView';
import { ReporteInventarioView } from './components/ReporteInventarioView';
import { ReporteDonativosView } from './components/ReporteDonativosView';
import type { RangoFecha } from './types';

export function ReportesPage() {
  const [rango, setRango] = React.useState<RangoFecha>({});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Asistencia, inventario y donativos. Por defecto, del mes en curso a hoy.</p>
        </div>
        <RangoFechaPicker rango={rango} onChange={setRango} />
      </div>

      <Tabs defaultValue="asistencia">
        <TabsList>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="donativos">Donativos</TabsTrigger>
        </TabsList>
        <TabsContent value="asistencia">
          <ReporteAsistenciaView rango={rango} />
        </TabsContent>
        <TabsContent value="inventario">
          <ReporteInventarioView rango={rango} />
        </TabsContent>
        <TabsContent value="donativos">
          <ReporteDonativosView rango={rango} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
