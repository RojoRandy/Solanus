import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProducto, useVariantes } from './api';
import { ETIQUETA_ESTADO } from './types';

export function ProductoDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const productoId = Number(id);

  const { data: producto, isLoading, isError } = useProducto(productoId);
  const { data: variantes, isLoading: cargandoVariantes } = useVariantes({ productoId, incluirInactivas: true, limit: 100 });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !producto) {
    return (
      <EmptyState
        icon={Package}
        title="No se encontró el producto"
        description="Puede que haya sido dado de baja o el enlace ya no sea válido."
        action={<Button render={<Link to="/inventario/productos" />}>Volver al catálogo</Button>}
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
            <h1 className="text-2xl font-semibold tracking-tight">{producto.nombre}</h1>
            <p className="text-sm text-muted-foreground">{producto.categoria.nombre}</p>
          </div>
        </div>
        <Button variant="outline" render={<Link to={`/inventario/productos/${producto.id}/editar`} />}>
          <Pencil />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del producto</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Código de barras</dt>
              <dd>{producto.codigoBarras ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Estado</dt>
              <dd>{producto.activo ? 'Activo' : 'Dado de baja'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existencias por unidad y estado</CardTitle>
        </CardHeader>
        <CardContent>
          {cargandoVariantes && <Skeleton className="h-24 w-full" />}
          {!cargandoVariantes && (!variantes || variantes.items.length === 0) && (
            <p className="text-sm text-muted-foreground">
              Este producto aún no tiene entradas registradas — sus variantes se crean al registrar una entrada.
            </p>
          )}
          {!cargandoVariantes && variantes && variantes.items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Existencia</TableHead>
                  <TableHead className="text-right">Stock mínimo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantes.items.map((variante) => (
                  <TableRow key={variante.id}>
                    <TableCell>{variante.unidad.nombre} ({variante.unidad.abrevia})</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ETIQUETA_ESTADO[variante.estado]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{variante.stockActual}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{variante.stockMinimo}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/inventario/variantes/${variante.id}`} className="text-sm text-primary hover:underline">
                        Ver detalle
                      </Link>
                    </TableCell>
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
