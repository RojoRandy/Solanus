import * as React from 'react';
import { CalendarCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectorMes } from './components/SelectorMes';
import { ExportarPdfButton } from './components/ExportarPdfButton';
import { ReporteAsistenciaView } from './components/ReporteAsistenciaView';
import { ReporteInventarioView } from './components/ReporteInventarioView';
import { ReporteDonativosView } from './components/ReporteDonativosView';
import { EvidenciasView } from './components/EvidenciasView';
import { CerrarMesDialog } from './components/CerrarMesDialog';
import { periodoActual } from './periodo';

export function ReportesPage() {
  const [periodo, setPeriodo] = React.useState(periodoActual());
  const [cierreAbierto, setCierreAbierto] = React.useState(false);
  const { user } = useAuth();
  const esAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Asistencia, inventario, donativos y evidencias del mes.</p>
        </div>
        <div className="flex items-center gap-2">
          <SelectorMes periodo={periodo} onChange={setPeriodo} />
          <ExportarPdfButton periodo={periodo} />
          {esAdmin && (
            <Button variant="outline" onClick={() => setCierreAbierto(true)}>
              <CalendarCheck />
              Cerrar mes
            </Button>
          )}
        </div>
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

      {esAdmin && (
        <CerrarMesDialog
          key={`${periodo.anio}-${periodo.mes}`}
          open={cierreAbierto}
          onOpenChange={setCierreAbierto}
          periodo={periodo}
        />
      )}
    </div>
  );
}
