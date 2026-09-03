import { HandHeart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useReporteDonativos } from '../api';
import type { RangoFecha } from '../types';

function formatMoneda(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}

export function ReporteDonativosView({ rango }: { rango: RangoFecha }) {
  const { data, isLoading } = useReporteDonativos(rango);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:w-1/2">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-primary">{data.totalLotes}</span>
            <span className="text-sm text-muted-foreground">Donativos recibidos</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-primary">{formatMoneda(data.valorEstimado)}</span>
            <span className="text-sm text-muted-foreground">Valor estimado</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Por bienhechor</CardTitle>
        </CardHeader>
        <CardContent>
          {data.porBienhechor.length === 0 ? (
            <EmptyState icon={HandHeart} title="Sin donativos en este periodo" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bienhechor</TableHead>
                  <TableHead className="text-right">Donativos</TableHead>
                  <TableHead className="text-right">Valor estimado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porBienhechor.map((b) => (
                  <TableRow key={b.bienhechorId}>
                    <TableCell className="font-medium">{b.bienhechor}</TableCell>
                    <TableCell className="text-right">{b.cantidadLotes}</TableCell>
                    <TableCell className="text-right">{formatMoneda(b.valorEstimado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
