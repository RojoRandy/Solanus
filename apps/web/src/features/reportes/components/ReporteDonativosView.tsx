import { Card, CardContent } from '@/components/ui/card';
import { HistorialDonativos } from '@/features/donativos/components/HistorialDonativos';
import { useReporteDonativos } from '../api';
import { rangoDelMes, type Periodo } from '../periodo';

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}

export function ReporteDonativosView({ periodo }: { periodo: Periodo }) {
  const rango = rangoDelMes(periodo);
  const { data, isLoading } = useReporteDonativos(rango);

  return (
    <div className="flex flex-col gap-6">
      {!isLoading && data && (
        <div className="grid grid-cols-2 gap-4 sm:w-1/2">
          <Card>
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold text-primary">{data.totalLotes}</span>
              <span className="text-sm text-muted-foreground">Donativos en especie</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold text-primary">{formatMoneda(data.valorEstimado)}</span>
              <span className="text-sm text-muted-foreground">Valor estimado en especie</span>
            </CardContent>
          </Card>
        </div>
      )}

      <HistorialDonativos desde={rango.desde} hasta={rango.hasta} mostrarBienhechor />
    </div>
  );
}
