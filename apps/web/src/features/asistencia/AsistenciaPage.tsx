import { UtensilsCrossed } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function AsistenciaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Turno de comida</h1>
      </div>
      <EmptyState
        icon={UtensilsCrossed}
        title="La pantalla de captura llega en la Fase 3"
        description="Sustituirá la hoja de papel: folio con Enter, menú del día, voluntarios del turno, insumos usados y donativos recibidos, con descuento automático de inventario."
      />
    </div>
  );
}
