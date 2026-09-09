import { ClipboardList, Info, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/ui/pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePaginacion } from '@/lib/pagination';
import { useMovimientos } from '@/features/inventario/api';
import { formatCantidad, formatFechaCorta } from '@/features/inventario/format';
import { useReporteInventario } from '../api';
import { rangoDelMes, type Periodo } from '../periodo';

const ETIQUETA_TIPO: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

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

export function ReporteInventarioView({ periodo }: { periodo: Periodo }) {
  const rango = rangoDelMes(periodo);
  const { data, isLoading, isError, refetch } = useReporteInventario(rango);
  const { page, limit, setPage } = usePaginacion(25);
  const movimientos = useMovimientos({ ...rango, page, limit });

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
              titulo="Entradas del mes"
              explicacion="Cantidad total que ingresó por compra o donación en el mes seleccionado."
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-destructive">−{data.movimientosPorTipo.salidas}</span>
            <TituloConTooltip
              titulo="Salidas del mes"
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
              titulo="Ajustes del mes"
              explicacion="Correcciones manuales de existencia (no ligadas a una compra, donativo o consumo). Se muestra lo agregado y lo descontado por separado."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos del mes</CardTitle>
        </CardHeader>
        <CardContent>
          {movimientos.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !movimientos.data || movimientos.data.items.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Sin movimientos en este mes" />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Registró</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientos.data.items.map((movimiento) => (
                      <TableRow key={movimiento.id}>
                        <TableCell>{formatFechaCorta(movimiento.fecha)}</TableCell>
                        <TableCell>{movimiento.producto.nombre}</TableCell>
                        <TableCell>{movimiento.variante.unidad.abrevia}</TableCell>
                        <TableCell>
                          <Badge variant={movimiento.tipo === 'SALIDA' ? 'destructive' : 'secondary'}>
                            {ETIQUETA_TIPO[movimiento.tipo] ?? movimiento.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{movimiento.motivo.nombre}</TableCell>
                        <TableCell className="text-right">{formatCantidad(movimiento.cantidad)}</TableCell>
                        <TableCell className="text-muted-foreground">{movimiento.registradoPor.nombre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls meta={movimientos.data.meta} onPageChange={setPage} />
            </div>
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
              <p className="text-sm text-muted-foreground">Sin mermas registradas en este mes.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {data.mermas.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex flex-col">
                      <span>{m.productoNombre}</span>
                      <span className="text-xs text-muted-foreground">{m.motivo}</span>
                    </div>
                    <span className="text-muted-foreground">
                      −{m.cantidad} {m.unidad} · {formatFechaCorta(m.fecha)}
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
              <p className="text-sm text-muted-foreground">Sin productos caducados en este mes.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {data.caducados.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span>{m.productoNombre}</span>
                    <span className="text-muted-foreground">
                      −{m.cantidad} {m.unidad} · {formatFechaCorta(m.fecha)}
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
