import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useInventarioItem, useMovimientos } from './api';
import { formatFechaCorta } from './format';

export function ProductoDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const itemId = Number(id);

  const { data: item, isLoading, isError } = useInventarioItem(itemId);
  const { data: movimientos, isLoading: cargandoMovimientos } = useMovimientos({ itemId });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <EmptyState
        icon={Package}
        title="No se encontró el producto"
        description="Puede que haya sido dado de baja o el enlace ya no sea válido."
        action={<Button render={<Link to="/inventario" />}>Volver al catálogo</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{item.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {item.categoria.nombre} · {item.unidad.nombre}
            </p>
          </div>
        </div>
        <Button variant="outline" render={<Link to={`/inventario/${item.id}/editar`} />}>
          <Pencil />
          Editar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Existencia actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {item.stockActual} <span className="text-sm font-normal text-muted-foreground">{item.unidad.abrevia}</span>
            </p>
            {item.stockBajo && (
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
            <p className="text-2xl font-semibold">{item.stockMinimo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{item.ubicacion?.nombre ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del producto</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Marca</dt>
              <dd>{item.marca ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Presentación</dt>
              <dd>{item.presentacion ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Código de barras</dt>
              <dd>{item.codigoBarras ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estado</dt>
              <dd>{item.activo ? 'Activo' : 'Dado de baja'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {cargandoMovimientos && <Skeleton className="h-24 w-full" />}
          {!cargandoMovimientos && (!movimientos || movimientos.length === 0) && (
            <p className="text-sm text-muted-foreground">Este producto todavía no tiene movimientos registrados.</p>
          )}
          {!cargandoMovimientos && movimientos && movimientos.length > 0 && (
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
                  {movimientos.slice(0, 20).map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{formatFechaCorta(movimiento.fecha)}</TableCell>
                      <TableCell>
                        <Badge variant={movimiento.tipo === 'SALIDA' ? 'destructive' : 'secondary'}>
                          {movimiento.tipo === 'ENTRADA'
                            ? 'Entrada'
                            : movimiento.tipo === 'SALIDA'
                              ? 'Salida'
                              : 'Ajuste'}
                        </Badge>
                      </TableCell>
                      <TableCell>{movimiento.motivo.nombre}</TableCell>
                      <TableCell className="text-right">{movimiento.cantidad}</TableCell>
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
