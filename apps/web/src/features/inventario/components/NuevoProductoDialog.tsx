import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { useUnidades, useCrearProducto } from '../api';
import { ProductoFormFields, type ProductoFormFieldsValue } from './ProductoFormFields';
import type { Producto } from '../types';

interface NuevoProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreado: (producto: Producto) => void;
}

/**
 * Alta rápida de producto completo (nombre, categoría, unidad, marca, contenido, crudo/cocido)
 * — usado desde insumos del turno, donativo en especie y el registro de entrada.
 */
export function NuevoProductoDialog({ open, onOpenChange, onCreado }: NuevoProductoDialogProps) {
  const [valor, setValor] = React.useState<ProductoFormFieldsValue>({ nombre: '', granel: false, estado: 'NO_APLICA' });
  const { data: unidades } = useUnidades();
  const crear = useCrearProducto();

  function limpiar() {
    setValor({ nombre: '', granel: false, estado: 'NO_APLICA' });
  }

  function registrar() {
    const { nombre, categoriaId, unidadId, estado, marca, granel, contenidoCantidad, contenidoUnidadId } = valor;
    if (!nombre.trim() || !categoriaId) {
      toast.error('Indica nombre y categoría del producto.');
      return;
    }
    if (!unidadId) {
      toast.error('Selecciona una unidad de medida.');
      return;
    }
    if (unidades?.find((unidad) => unidad.id === unidadId)?.indicarContenido
      && (contenidoCantidad === undefined || !Number.isFinite(contenidoCantidad) || contenidoCantidad <= 0 || !contenidoUnidadId)) {
      toast.error('Indica una cantidad de contenido mayor a cero y su unidad.');
      return;
    }
    crear.mutate(
      { nombre: nombre.trim(), categoriaId, unidadId, estado, marca, granel, contenidoCantidad, contenidoUnidadId },
      {
        onSuccess: (producto) => {
          toast.success(`Producto "${producto.nombre}" creado.`);
          limpiar();
          onCreado(producto);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo crear el producto.'),
      },
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <ProductoFormFields value={valor} onChange={setValor} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={registrar} disabled={crear.isPending}>
              {crear.isPending ? 'Guardando…' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
