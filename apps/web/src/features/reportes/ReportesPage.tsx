import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectorMes } from './components/SelectorMes';
import { ReporteAsistenciaView } from './components/ReporteAsistenciaView';
import { ReporteInventarioView } from './components/ReporteInventarioView';
import { ReporteDonativosView } from './components/ReporteDonativosView';
import { EvidenciasView } from './components/EvidenciasView';
import { periodoActual } from './periodo';

export function ReportesPage() {
  const [periodo, setPeriodo] = React.useState(periodoActual());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Asistencia, inventario, donativos y evidencias del mes.</p>
        </div>
        <SelectorMes periodo={periodo} onChange={setPeriodo} />
      </div>

      <Tabs defaultValue="asistencia">
        <TabsList>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="donativos">Donativos</TabsTrigger>
          <TabsTrigger value="evidencias">Evidencias</TabsTrigger>
        </TabsList>
        <TabsContent value="asistencia">
          <ReporteAsistenciaView periodo={periodo} />
        </TabsContent>
        <TabsContent value="inventario">
          <ReporteInventarioView periodo={periodo} />
        </TabsContent>
        <TabsContent value="donativos">
          <ReporteDonativosView periodo={periodo} />
        </TabsContent>
        <TabsContent value="evidencias">
          <EvidenciasView periodo={periodo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
