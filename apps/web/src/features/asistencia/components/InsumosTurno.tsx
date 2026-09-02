import * as React from 'react';
import { toast } from 'sonner';
import { Package, HandHeart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { ComboboxField } from '@/features/inventario/ComboboxField';
import { useInventarioItems, useMovimientos } from '@/features/inventario/api';
import { ApiError } from '@/lib/api-client';
import { useRegistrarInsumoTurno } from '../api';
import { RegistrarDonativoDialog } from './RegistrarDonativoDialog';

export function InsumosTurno({ turnoId }: { turnoId: number }) {
  const [itemId, setItemId] = React.useState<number>();
  const [cantidad, setCantidad] = React.useState('');
  const [donativoAbierto, setDonativoAbierto] = React.useState(false);

  const { data: items } = useInventarioItems();
  const { data: movimientos } = useMovimientos({ turnoId });
  const registrarInsumo = useRegistrarInsumoTurno();

  const opciones = (items ?? []).map((item) => ({
    value: item.id,
    label: `${item.nombre}${item.marca ? ` — ${item.marca}` : ''} (${item.stockActual} ${item.unidad.abrevia})`,
  }));

  function registrar() {
    const cantidadNum = Number(cantidad);
    if (!itemId || !cantidadNum || cantidadNum <= 0) {
      toast.error('Elige un producto y una cantidad válida.');
      return;
    }
    registrarInsumo.mutate(
      { turnoId, itemId, cantidad: cantidadNum },
      {
        onSuccess: () => {
          toast.success('Insumo descontado del inventario.');
          setItemId(undefined);
          setCantidad('');
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el insumo.'),
      },
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Insumos usados</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setDonativoAbierto(true)}>
          <HandHeart /> Registrar donativo
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <ComboboxField options={opciones} value={itemId} onValueChange={setItemId} placeholder="Producto…" />
          </div>
          <Input
            type="number"
            min={0}
            step="0.001"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="sm:w-28"
          />
          <Button onClick={registrar} disabled={registrarInsumo.isPending}>
            Descontar
          </Button>
        </div>

        {!movimientos || movimientos.length === 0 ? (
          <EmptyState icon={Package} title="Sin insumos registrados en este turno" className="py-6" />
        ) : (
          <div className="flex flex-col divide-y divide-border text-sm">
            {movimientos.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-1.5">
                <span>{m.item.nombre}</span>
                <span className="text-muted-foreground">
                  {m.tipo === 'SALIDA' ? '−' : '+'}
                  {m.cantidad}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <RegistrarDonativoDialog open={donativoAbierto} onOpenChange={setDonativoAbierto} />
    </Card>
  );
}
