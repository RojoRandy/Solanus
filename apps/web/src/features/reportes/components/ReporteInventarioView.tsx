import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useReporteInventario } from '../api';
import type { RangoFecha } from '../types';

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

export function ReporteInventarioView({ rango }: { rango: RangoFecha }) {
  const { data, isLoading } = useReporteInventario(rango);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-success">+{data.movimientosPorTipo.ENTRADA}</span>
            <span className="text-sm text-muted-foreground">Entradas del periodo</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-destructive">−{data.movimientosPorTipo.SALIDA}</span>
            <span className="text-sm text-muted-foreground">Salidas del periodo</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">{data.movimientosPorTipo.AJUSTE}</span>
            <span className="text-sm text-muted-foreground">Ajustes del periodo</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existencias actuales</CardTitle>
        </CardHeader>
        <CardContent>
          {data.existencias.length === 0 ? (
            <EmptyState icon={Package} title="Sin productos en el catálogo" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Existencia</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.existencias.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{item.categoria}</TableCell>
                    <TableCell className="text-right">
                      {item.stockActual} {item.unidad}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.stockMinimo} {item.unidad}
                    </TableCell>
                    <TableCell>
                      {item.stockBajo && (
                        <Badge variant="outline" className="border-destructive text-destructive">
                          Stock bajo
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mermas</CardTitle>
          </CardHeader>
          <CardContent>
            {data.mermas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin mermas registradas en este periodo.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {data.mermas.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span>{m.itemNombre}</span>
                    <span className="text-muted-foreground">
                      −{m.cantidad} · {formatFecha(m.fecha)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caducados</CardTitle>
          </CardHeader>
          <CardContent>
            {data.caducados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin productos caducados en este periodo.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {data.caducados.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span>{m.itemNombre}</span>
                    <span className="text-muted-foreground">
                      −{m.cantidad} · {formatFecha(m.fecha)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
