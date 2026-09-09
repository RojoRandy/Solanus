import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useReporteAsistencia } from '../api';
import { etiquetaPeriodo, type Periodo } from '../periodo';

export function ReporteAsistenciaView({ periodo }: { periodo: Periodo }) {
  const { data, isLoading } = useReporteAsistencia(periodo);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!data) return null;

  const dias = Array.from({ length: data.diasDelMes }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-primary">{data.totalAsistencias}</span>
            <span className="text-sm text-muted-foreground">Total del periodo</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.desayuno}</span>
            <span className="text-sm text-muted-foreground">Desayuno</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.comida}</span>
            <span className="text-sm text-muted-foreground">Comida</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.cena}</span>
            <span className="text-sm text-muted-foreground">Cena</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia por día — {etiquetaPeriodo(periodo)}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.comensales.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="Sin asistencias en este mes" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="sticky left-0 z-10 bg-card">
                    Comensal
                  </TableHead>
                  {dias.map((dia) => (
                    <TableHead key={dia} scope="col" className="w-7 px-0 text-center">
                      {dia}
                    </TableHead>
                  ))}
                  <TableHead scope="col" className="text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.comensales.map((fila) => (
                  <TableRow key={fila.folio}>
                    <TableHead scope="row" className="sticky left-0 z-10 w-52 bg-card font-normal whitespace-nowrap">
                      <span className="text-muted-foreground">{fila.folio}</span> {fila.nombre}
                    </TableHead>
                    {fila.dias.map((valor, i) => (
                      <TableCell
                        key={i}
                        className={
                          valor > 0
                            ? 'bg-[#FFBF00] text-center text-xs text-[#2A2020] tabular-nums'
                            : 'text-center text-xs tabular-nums'
                        }
                        title={valor > 0 ? `${i + 1} de ${etiquetaPeriodo(periodo)}: ${valor} turno${valor > 1 ? 's' : ''}` : undefined}
                      >
                        {valor > 0 ? valor : ''}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">{fila.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableHead scope="row" className="sticky left-0 z-10 bg-muted/50 font-medium">
                    Total
                  </TableHead>
                  {data.totalesPorDia.map((total, i) => (
                    <TableCell key={i} className="text-center text-xs font-medium tabular-nums">
                      {total > 0 ? total : ''}
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
