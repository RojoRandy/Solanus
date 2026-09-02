import { Package } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function InventarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
      </div>
      <EmptyState
        icon={Package}
        title="Módulo en construcción"
        description="Catálogo, lotes y movimientos de inventario llegan en la Fase 2."
      />
    </div>
  );
}
