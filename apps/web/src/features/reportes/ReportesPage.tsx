import { FileBarChart } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function ReportesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
      </div>
      <EmptyState
        icon={FileBarChart}
        title="Módulo en construcción"
        description="Asistencia, inventario y donativos llegan en la Fase 4."
      />
    </div>
  );
}
