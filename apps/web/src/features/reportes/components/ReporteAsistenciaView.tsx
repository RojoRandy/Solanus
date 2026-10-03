import { UserPlus, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useReporteAsistencia } from '../api';
import { formatFechaCortaSoloDia } from '@/lib/fecha';
import { etiquetaPeriodo, type Periodo } from '../periodo';

const ETIQUETA_HORARIO = { DESAYUNO: 'Desayuno', COMIDA: 'Comida', CENA: 'Cena' } as const;

export function ReporteAsistenciaView({ periodo }: { periodo: Periodo }) {
  const { data, isLoading } = useReporteAsistencia(periodo);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!data) return null;

  const dias = Array.from({ length: data.diasDelMes }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.totalPrimeraVez}</span>
            <span className="text-sm text-muted-foreground">Primera vez</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia por día — {etiquetaPeriodo(periodo)}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.comensales.length === 0 && data.totalPrimeraVez === 0 ? (
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
                    Total comensales
                  </TableHead>
                  {data.totalesPorDia.map((total, i) => (
                    <TableCell key={i} className="text-center text-xs font-medium tabular-nums">
                      {total > 0 ? total : ''}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-medium">{data.totalAsistencias}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead scope="row" className="sticky left-0 z-10 bg-muted/50 font-medium">
                    Primera vez
                  </TableHead>
                  {data.primeraVezPorDia.map((total, i) => (
                    <TableCell key={i} className="text-center text-xs font-medium tabular-nums">
                      {total > 0 ? total : ''}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-medium">{data.totalPrimeraVez}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primera vez — {etiquetaPeriodo(periodo)}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.primeraVez.length === 0 ? (
            <EmptyState icon={UserPlus} title="Sin asistentes de primera vez en este mes" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Nombre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.primeraVez.map((fila, i) => (
                  <TableRow key={i}>
                    <TableCell className="tabular-nums">{formatFechaCortaSoloDia(fila.fecha)}</TableCell>
                    <TableCell>{ETIQUETA_HORARIO[fila.horario]}</TableCell>
                    <TableCell>{fila.nombre}</TableCell>
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
