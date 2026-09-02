import { UserCog } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function UsuariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios del sistema</h1>
      </div>
      <EmptyState
        icon={UserCog}
        title="Módulo en construcción"
        description="Alta y edición de usuarios del sistema llega en un próximo commit de la Fase 1."
      />
    </div>
  );
}
