import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLotesVariante, useMovimientos, useVariante } from './api';
import { formatFechaCorta, formatMoneda } from './format';
import { ETIQUETA_ESTADO } from './types';

export function VarianteDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const varianteId = Number(id);

  const { data: variante, isLoading, isError } = useVariante(varianteId);
  const { data: lotes, isLoading: cargandoLotes } = useLotesVariante(varianteId);
  const { data: movimientos, isLoading: cargandoMovimientos } = useMovimientos({ varianteId, limit: 20 });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !variante) {
    return (
      <EmptyState
        icon={Package}
        title="No se encontró la variante"
        description="Puede que haya sido dada de baja o el enlace ya no sea válido."
        action={<Button render={<Link to="/inventario" />}>Volver a existencias</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{variante.producto.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {variante.categoria.nombre} · {variante.unidad.nombre} · {ETIQUETA_ESTADO[variante.estado]}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Existencia actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {variante.stockActual} <span className="text-sm font-normal text-muted-foreground">{variante.unidad.abrevia}</span>
            </p>
            {variante.stockBajo && (
              <Badge variant="destructive" className="mt-2 bg-warning text-warning-foreground">
                Por debajo del mínimo
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Stock mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{variante.stockMinimo}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lotes con existencia</CardTitle>
        </CardHeader>
        <CardContent>
          {cargandoLotes && <Skeleton className="h-24 w-full" />}
          {!cargandoLotes && (!lotes || lotes.length === 0) && (
            <p className="text-sm text-muted-foreground">No hay lotes con existencia disponible.</p>
          )}
          {!cargandoLotes && lotes && lotes.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead className="text-right">Disponible</TableHead>
                    <TableHead>Caducidad</TableHead>
                    <TableHead>Ingreso</TableHead>
                    <TableHead className="text-right">Costo unitario</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Bienhechor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell>{lote.marca ?? '—'}</TableCell>
                      <TableCell className="text-right">{lote.cantidadDisponible}</TableCell>
                      <TableCell>{lote.fechaCaducidad ? formatFechaCorta(lote.fechaCaducidad) : 'No caduca'}</TableCell>
                      <TableCell>{formatFechaCorta(lote.fechaIngreso)}</TableCell>
                      <TableCell className="text-right">{formatMoneda(lote.costoUnitario)}</TableCell>
                      <TableCell>{lote.origen === 'DONADO' ? 'Donado' : 'Comprado'}</TableCell>
                      <TableCell className="text-muted-foreground">{lote.bienhechor?.nombre ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {cargandoMovimientos && <Skeleton className="h-24 w-full" />}
          {!cargandoMovimientos && (!movimientos || movimientos.items.length === 0) && (
            <p className="text-sm text-muted-foreground">Esta variante todavía no tiene movimientos registrados.</p>
          )}
          {!cargandoMovimientos && movimientos && movimientos.items.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Registró</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.items.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{formatFechaCorta(movimiento.fecha)}</TableCell>
                      <TableCell>
                        <Badge variant={movimiento.tipo === 'SALIDA' ? 'destructive' : 'secondary'}>
                          {movimiento.tipo === 'ENTRADA' ? 'Entrada' : movimiento.tipo === 'SALIDA' ? 'Salida' : 'Ajuste'}
                        </Badge>
                      </TableCell>
                      <TableCell>{movimiento.motivo.nombre}</TableCell>
                      <TableCell className="text-right">
                        {movimiento.cantidad} {movimiento.variante.unidad.abrevia}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{movimiento.registradoPor.nombre}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
