import { Info, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ETIQUETA_ESTADO } from '@/features/inventario/types';
import { useReporteInventario } from '../api';
import type { RangoFecha } from '../types';

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

function TituloConTooltip({ titulo, explicacion }: { titulo: string; explicacion: string }) {
  return (
    <span className="flex items-center gap-1 text-sm text-muted-foreground">
      {titulo}
      <Tooltip>
        <TooltipTrigger render={<Info className="size-3.5" />} />
        <TooltipContent>{explicacion}</TooltipContent>
      </Tooltip>
    </span>
  );
}

export function ReporteInventarioView({ rango }: { rango: RangoFecha }) {
  const { data, isLoading, isError, refetch } = useReporteInventario(rango);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={Package}
        title="No se pudo cargar el reporte"
        description="Ocurrió un problema al consultar el inventario. Intenta de nuevo."
        action={
          <button type="button" onClick={() => void refetch()} className="text-sm text-primary underline-offset-4 hover:underline">
            Reintentar
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-success">+{data.movimientosPorTipo.entradas}</span>
            <TituloConTooltip
              titulo="Entradas del periodo"
              explicacion="Cantidad total que ingresó por compra o donación en el periodo seleccionado."
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-destructive">−{data.movimientosPorTipo.salidas}</span>
            <TituloConTooltip
              titulo="Salidas del periodo"
              explicacion="Cantidad consumida en turnos de comida, más mermas y productos caducados."
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold">
              +{data.movimientosPorTipo.ajustesPositivos} / −{data.movimientosPorTipo.ajustesNegativos}
            </span>
            <TituloConTooltip
              titulo="Ajustes del periodo"
              explicacion="Correcciones manuales de existencia (no ligadas a una compra, donativo o consumo). Se muestra lo agregado y lo descontado por separado."
            />
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
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Existencia</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.existencias.map((item) => (
                  <TableRow key={item.varianteId}>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{item.categoria}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ETIQUETA_ESTADO[item.estado]}</Badge>
                    </TableCell>
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
            <CardTitle className="flex items-center gap-1.5">
              Mermas
              <Tooltip>
                <TooltipTrigger render={<Info className="size-3.5 text-muted-foreground" />} />
                <TooltipContent>Producto retirado por deterioro o caducidad antes de consumirse.</TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.mermas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin mermas registradas en este periodo.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {data.mermas.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex flex-col">
                      <span>{m.productoNombre}</span>
                      <span className="text-xs text-muted-foreground">{m.motivo}</span>
                    </div>
                    <span className="text-muted-foreground">
                      −{m.cantidad} {m.unidad} · {formatFecha(m.fecha)}
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
                    <span>{m.productoNombre}</span>
                    <span className="text-muted-foreground">
                      −{m.cantidad} {m.unidad} · {formatFecha(m.fecha)}
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
