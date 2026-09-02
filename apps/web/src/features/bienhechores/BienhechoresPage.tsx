import { HandHeart } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function BienhechoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bienhechores</h1>
      </div>
      <EmptyState
        icon={HandHeart}
        title="Módulo en construcción"
        description="Registro de bienhechores llega en la Fase 2."
      />
    </div>
  );
}
