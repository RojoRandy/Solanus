import { HeartHandshake } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function VoluntariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Voluntarios</h1>
      </div>
      <EmptyState
        icon={HeartHandshake}
        title="Módulo en construcción"
        description="Registro y listado de voluntarios llega en la Fase 2."
      />
    </div>
  );
}
