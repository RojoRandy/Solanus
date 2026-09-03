import * as React from 'react';
import { toast } from 'sonner';
import { Package, HandHeart, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { ComboboxField } from '@/features/inventario/ComboboxField';
import { useMovimientos, useVariantes } from '@/features/inventario/api';
import { NuevoProductoDialog } from '@/features/inventario/components/NuevoProductoDialog';
import { ApiError } from '@/lib/api-client';
import { useRegistrarInsumoTurno } from '../api';
import { RegistrarDonativoDialog } from './RegistrarDonativoDialog';

export function InsumosTurno({ turnoId }: { turnoId: number }) {
  const [varianteId, setVarianteId] = React.useState<number>();
  const [cantidad, setCantidad] = React.useState('');
  const [donativoAbierto, setDonativoAbierto] = React.useState(false);
  const [nuevoProductoAbierto, setNuevoProductoAbierto] = React.useState(false);

  const { data: variantesPag } = useVariantes({ limit: 200 });
  const { data: movimientosPag } = useMovimientos({ turnoId });
  const registrarInsumo = useRegistrarInsumoTurno();

  const opciones = (variantesPag?.items ?? []).map((v) => ({
    value: v.id,
    label: `${v.producto.nombre} · ${v.unidad.abrevia} · ${v.estado === 'CRUDO' ? 'crudo' : 'cocido'} (${v.stockActual} disponible)`,
  }));

  function registrar() {
    const cantidadNum = Number(cantidad);
    if (!varianteId || !cantidadNum || cantidadNum <= 0) {
      toast.error('Elige un producto y una cantidad válida.');
      return;
    }
    registrarInsumo.mutate(
      { turnoId, varianteId, cantidad: cantidadNum },
      {
        onSuccess: () => {
          toast.success('Insumo descontado del inventario.');
          setVarianteId(undefined);
          setCantidad('');
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el insumo.'),
      },
    );
  }

  const movimientos = movimientosPag?.items ?? [];

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
            <ComboboxField options={opciones} value={varianteId} onValueChange={setVarianteId} placeholder="Producto…" />
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
          <Button type="button" variant="outline" size="icon" onClick={() => setNuevoProductoAbierto(true)} title="Producto nuevo">
            <Plus />
          </Button>
        </div>

        {movimientos.length === 0 ? (
          <EmptyState icon={Package} title="Sin insumos registrados en este turno" className="py-6" />
        ) : (
          <div className="flex flex-col divide-y divide-border text-sm">
            {movimientos.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-1.5">
                <span>{m.producto.nombre}</span>
                <span className="text-muted-foreground">
                  {m.tipo === 'SALIDA' ? '−' : '+'}
                  {m.cantidad} {m.variante.unidad.abrevia}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <RegistrarDonativoDialog open={donativoAbierto} onOpenChange={setDonativoAbierto} />
      <NuevoProductoDialog
        open={nuevoProductoAbierto}
        onOpenChange={setNuevoProductoAbierto}
        onCreado={(producto) => toast.success(`"${producto.nombre}" se agregó al catálogo — regístralo con una entrada para tener existencia.`)}
      />
    </Card>
  );
}
