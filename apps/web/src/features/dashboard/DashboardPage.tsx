import { LayoutDashboard } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/lib/auth-context';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {user?.nombre.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Panel general del Comedor Solanus.</p>
      </div>
      <EmptyState
        icon={LayoutDashboard}
        title="Los indicadores llegan en la Fase 4"
        description="Total de comensales, alimentos próximos a vencer, stock bajo y asistencia del día aparecerán aquí una vez que Comensales, Inventario y Asistencia estén integrados."
      />
    </div>
  );
}
