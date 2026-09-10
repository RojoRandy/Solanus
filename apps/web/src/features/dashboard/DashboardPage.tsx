import { Link } from 'react-router-dom';
import { AlertTriangle, HandHeart, PackageX, Users, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/lib/auth-context';
import { diasHastaSoloDia, formatFechaCortaSoloDia } from '@/lib/fecha';
import { CalendarioProximosDias } from '@/features/agenda/components/CalendarioProximosDias';
import { formatCantidad } from '@/features/inventario/format';
import { useResumenDashboard } from './api';
import { StatCard } from './components/StatCard';

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: resumen, isLoading, isError } = useResumenDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {user?.nombre.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Panel general del Comedor Solanus.</p>
      </div>

      <CalendarioProximosDias />

      {isLoading && <p className="text-sm text-muted-foreground">Cargando indicadores…</p>}

      {isError && (
        <EmptyState icon={AlertTriangle} title="No se pudieron cargar los indicadores" description="Revisa tu conexión e intenta de nuevo." />
      )}

      {resumen && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Comensales activos" value={resumen.totalComensales} />
            <StatCard
              icon={UtensilsCrossed}
              label="Asistencias hoy"
              value={resumen.asistencia.hoy}
              hint={`Promedio últimos 7 días: ${resumen.asistencia.promedioUltimos7Dias}`}
              tone="success"
            />
            <StatCard
              icon={AlertTriangle}
              label="Próximos a vencer"
              value={resumen.proximosAVencer.length}
              hint="Próximos 15 días"
              tone={resumen.proximosAVencer.length > 0 ? 'warning' : 'default'}
            />
            <StatCard
              icon={PackageX}
              label="Stock bajo"
              value={resumen.stockBajo.length}
              tone={resumen.stockBajo.length > 0 ? 'danger' : 'default'}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <StatCard
                icon={HandHeart}
                label="Donativos este mes"
                value={resumen.donativosDelMes.totalLotes}
                hint={formatMoneda(resumen.donativosDelMes.valorEstimado)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximos a vencer</CardTitle>
              </CardHeader>
              <CardContent>
                {resumen.proximosAVencer.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nada por vencer en los próximos 15 días.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {resumen.proximosAVencer.map((lote) => (
                      <Link
                        key={lote.loteId}
                        to={`/inventario/variantes/${lote.varianteId}`}
                        className="flex items-center justify-between py-2.5 hover:text-primary"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{lote.productoNombre}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCantidad(lote.cantidadDisponible, lote.unidad)} disponibles
                          </span>
                        </div>
                        <Badge variant="outline" className="border-warning text-warning">
                          {formatFechaCortaSoloDia(lote.fechaCaducidad)} · {diasHastaSoloDia(lote.fechaCaducidad)} días
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock bajo</CardTitle>
              </CardHeader>
              <CardContent>
                {resumen.stockBajo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todo el inventario está por encima de su mínimo.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {resumen.stockBajo.map((item) => (
                      <Link
                        key={item.varianteId}
                        to={`/inventario/variantes/${item.varianteId}`}
                        className="flex items-center justify-between py-2.5 hover:text-primary"
                      >
                        <span className="text-sm font-medium">{item.productoNombre}</span>
                        <Badge variant="outline" className="border-destructive text-destructive">
                          {formatCantidad(item.stockActual, item.unidad)} / {formatCantidad(item.stockMinimo, item.unidad)}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
