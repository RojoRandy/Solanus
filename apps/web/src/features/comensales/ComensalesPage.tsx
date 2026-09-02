import { Users } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function ComensalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comensales</h1>
      </div>
      <EmptyState
        icon={Users}
        title="Módulo en construcción"
        description="Alta, expedientes y búsqueda de comensales llegan en la Fase 2."
      />
    </div>
  );
}
