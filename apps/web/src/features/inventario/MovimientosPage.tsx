import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { ComboboxField } from './ComboboxField';
import { useInventarioItems, useMovimientos } from './api';
import { formatFechaCorta } from './format';

const ETIQUETA_TIPO: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

export function MovimientosPage() {
  const navigate = useNavigate();
  const { data: items } = useInventarioItems();
  const [itemId, setItemId] = useState<number | undefined>(undefined);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const opcionesProductos = useMemo(
    () => (items ?? []).map((item) => ({ value: item.id, label: item.nombre })),
    [items],
  );

  const { data: movimientos, isLoading, isError, refetch } = useMovimientos({
    itemId,
    desde: desde || undefined,
    hasta: hasta || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Movimientos de inventario</h1>
          <p className="text-sm text-muted-foreground">Histórico de entradas, salidas y ajustes</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <div className="flex min-w-56 flex-col gap-1.5">
          <Label>Producto</Label>
          <ComboboxField
            options={opcionesProductos}
            value={itemId}
            onValueChange={setItemId}
            placeholder="Todos los productos"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
        </div>
        {(itemId ?? desde ?? hasta) && (
          <Button
            variant="ghost"
            onClick={() => {
              setItemId(undefined);
              setDesde('');
              setHasta('');
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={ClipboardList}
          title="No se pudieron cargar los movimientos"
          description="Ocurrió un problema al consultar el histórico. Intenta de nuevo."
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      )}

      {!isLoading && !isError && movimientos && movimientos.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="Sin movimientos"
          description="No hay movimientos registrados con estos filtros."
        />
      )}

      {!isLoading && !isError && movimientos && movimientos.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Registró</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>{formatFechaCorta(movimiento.fecha)}</TableCell>
                  <TableCell>
                    <Link to={`/inventario/${movimiento.item.id}`} className="hover:underline">
                      {movimiento.item.nombre}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={movimiento.tipo === 'SALIDA' ? 'destructive' : 'secondary'}>
                      {ETIQUETA_TIPO[movimiento.tipo] ?? movimiento.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{movimiento.motivo.nombre}</TableCell>
                  <TableCell className="text-right">{movimiento.cantidad}</TableCell>
                  <TableCell className="text-muted-foreground">{movimiento.registradoPor.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{movimiento.notas ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
