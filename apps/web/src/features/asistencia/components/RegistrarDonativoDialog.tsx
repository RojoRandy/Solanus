import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { ComboboxField } from '@/features/inventario/ComboboxField';
import { useProductos, useRegistrarDonativo, useUnidades } from '@/features/inventario/api';
import { NuevaUnidadDialog } from '@/features/inventario/components/NuevaUnidadDialog';
import { NuevoProductoDialog } from '@/features/inventario/components/NuevoProductoDialog';
import { useBienhechores } from '@/features/bienhechores/api';
import { NuevoBienhechorDialog } from '@/features/bienhechores/components/NuevoBienhechorDialog';
import type { EstadoProducto, LineaDonativoInput } from '@/features/inventario/types';
import { ApiError } from '@/lib/api-client';

interface RegistrarDonativoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LineaForm {
  key: number;
  productoId?: number;
  estado: EstadoProducto;
  cantidad: string;
  unidadId?: number;
  costoUnitario: string;
  fechaCaducidad?: string;
}

let contadorLinea = 0;
function nuevaLinea(): LineaForm {
  contadorLinea += 1;
  return { key: contadorLinea, estado: 'CRUDO', cantidad: '', costoUnitario: '' };
}

/**
 * Registro de donativos recibidos durante el turno: primero el bienhechor
 * (con alta rápida si es nuevo), luego una o más líneas de producto — cada
 * una puede dar de alta producto y unidad de medida sin salir del diálogo.
 */
export function RegistrarDonativoDialog({ open, onOpenChange }: RegistrarDonativoDialogProps) {
  const [bienhechorId, setBienhechorId] = React.useState<number>();
  const [fechaIngreso, setFechaIngreso] = React.useState<string | undefined>(new Date().toISOString().slice(0, 10));
  const [lineas, setLineas] = React.useState<LineaForm[]>([nuevaLinea()]);

  const [nuevoBienhechorAbierto, setNuevoBienhechorAbierto] = React.useState(false);
  const [nuevoProductoLinea, setNuevoProductoLinea] = React.useState<number | null>(null);
  const [nuevaUnidadLinea, setNuevaUnidadLinea] = React.useState<number | null>(null);

  const { data: bienhechores } = useBienhechores();
  const { data: productosPag } = useProductos({ limit: 200 });
  const { data: unidades } = useUnidades();
  const registrarDonativo = useRegistrarDonativo();

  const opcionesBienhechor = (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre }));
  const opcionesProducto = (productosPag?.items ?? []).map((p) => ({ value: p.id, label: p.nombre }));

  function limpiar() {
    setBienhechorId(undefined);
    setFechaIngreso(new Date().toISOString().slice(0, 10));
    setLineas([nuevaLinea()]);
  }

  function actualizarLinea(key: number, cambios: Partial<LineaForm>) {
    setLineas((prev) => prev.map((linea) => (linea.key === key ? { ...linea, ...cambios } : linea)));
  }

  function quitarLinea(key: number) {
    setLineas((prev) => (prev.length > 1 ? prev.filter((linea) => linea.key !== key) : prev));
  }

  function registrar() {
    if (!bienhechorId) {
      toast.error('Selecciona quién hizo la donación.');
      return;
    }
    const lineasValidas: LineaDonativoInput[] = [];
    for (const linea of lineas) {
      const cantidadNum = Number(linea.cantidad);
      if (!linea.productoId || !cantidadNum || cantidadNum <= 0 || !linea.unidadId) {
        toast.error('Completa producto, cantidad y unidad en cada línea.');
        return;
      }
      lineasValidas.push({
        productoId: linea.productoId,
        estado: linea.estado,
        cantidad: cantidadNum,
        unidadId: linea.unidadId,
        costoUnitario: linea.costoUnitario ? Number(linea.costoUnitario) : undefined,
        fechaCaducidad: linea.fechaCaducidad,
      });
    }

    registrarDonativo.mutate(
      { bienhechorId, fechaIngreso, lineas: lineasValidas },
      {
        onSuccess: () => {
          toast.success('Donativo registrado en el inventario.');
          limpiar();
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el donativo.'),
      },
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar donativo recibido</DialogTitle>
            <DialogDescription>Captura al bienhechor y los productos que donó.</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              <Label>Bienhechor</Label>
              <div className="flex gap-2">
                <ComboboxField options={opcionesBienhechor} value={bienhechorId} onValueChange={setBienhechorId} placeholder="¿Quién donó?" />
                <Button type="button" variant="outline" size="icon" onClick={() => setNuevoBienhechorAbierto(true)} title="Nuevo bienhechor">
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Fecha de ingreso</Label>
              <DatePicker value={fechaIngreso} onChange={setFechaIngreso} />
            </div>

            <Separator />

            {lineas.map((linea, index) => (
              <div key={linea.key} className="flex flex-col gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Producto {index + 1}</span>
                  {lineas.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => quitarLinea(linea.key)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <ComboboxField
                    options={opcionesProducto}
                    value={linea.productoId}
                    onValueChange={(value) => actualizarLinea(linea.key, { productoId: value })}
                    placeholder="Producto…"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setNuevoProductoLinea(linea.key)} title="Nuevo producto">
                    <Plus />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    items={{ CRUDO: 'Crudo', COCIDO: 'Cocido' }}
                    value={linea.estado}
                    onValueChange={(value) => actualizarLinea(linea.key, { estado: value as EstadoProducto })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRUDO">Crudo</SelectItem>
                      <SelectItem value="COCIDO">Cocido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    step="0.001"
                    placeholder="Cantidad"
                    value={linea.cantidad}
                    onChange={(event) => actualizarLinea(linea.key, { cantidad: event.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Select
                    items={Object.fromEntries((unidades ?? []).map((u) => [String(u.id), `${u.nombre} (${u.abrevia})`]))}
                    value={linea.unidadId ? String(linea.unidadId) : undefined}
                    onValueChange={(value) => actualizarLinea(linea.key, { unidadId: Number(value) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades?.map((unidad) => (
                        <SelectItem key={unidad.id} value={String(unidad.id)}>
                          {unidad.nombre} ({unidad.abrevia})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setNuevaUnidadLinea(linea.key)} title="Nueva unidad">
                    <Plus />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Costo unitario (opcional)"
                    value={linea.costoUnitario}
                    onChange={(event) => actualizarLinea(linea.key, { costoUnitario: event.target.value })}
                  />
                  <DatePicker
                    value={linea.fechaCaducidad}
                    onChange={(value) => actualizarLinea(linea.key, { fechaCaducidad: value })}
                    placeholder="Caducidad"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={() => setLineas((prev) => [...prev, nuevaLinea()])}>
              <Plus />
              Agregar otro producto
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={registrar} disabled={registrarDonativo.isPending}>
              {registrarDonativo.isPending ? 'Guardando…' : 'Registrar donativo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NuevoBienhechorDialog open={nuevoBienhechorAbierto} onOpenChange={setNuevoBienhechorAbierto} onCreado={(b) => setBienhechorId(b.id)} />
      <NuevoProductoDialog
        open={nuevoProductoLinea !== null}
        onOpenChange={(open) => !open && setNuevoProductoLinea(null)}
        onCreado={(producto) => nuevoProductoLinea !== null && actualizarLinea(nuevoProductoLinea, { productoId: producto.id })}
      />
      <NuevaUnidadDialog
        open={nuevaUnidadLinea !== null}
        onOpenChange={(open) => !open && setNuevaUnidadLinea(null)}
        onCreada={(unidad) => nuevaUnidadLinea !== null && actualizarLinea(nuevaUnidadLinea, { unidadId: unidad.id })}
      />
    </>
  );
}
