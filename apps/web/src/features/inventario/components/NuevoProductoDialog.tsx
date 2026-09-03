import * as React from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/lib/api-client';
import { useCategorias, useCrearProducto } from '../api';
import { NuevaCategoriaDialog } from './NuevaCategoriaDialog';
import type { Producto } from '../types';

interface NuevoProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreado: (producto: Producto) => void;
}

/** Alta rápida de producto (solo nombre + categoría) — usado en Registrar entrada, insumos y donativos. */
export function NuevoProductoDialog({ open, onOpenChange, onCreado }: NuevoProductoDialogProps) {
  const [nombre, setNombre] = React.useState('');
  const [categoriaId, setCategoriaId] = React.useState<number>();
  const [nuevaCategoriaAbierta, setNuevaCategoriaAbierta] = React.useState(false);

  const { data: categorias } = useCategorias();
  const crear = useCrearProducto();

  function limpiar() {
    setNombre('');
    setCategoriaId(undefined);
  }

  function registrar() {
    if (!nombre.trim() || !categoriaId) {
      toast.error('Indica nombre y categoría del producto.');
      return;
    }
    crear.mutate(
      { nombre: nombre.trim(), categoriaId },
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nuevo-producto-nombre">Nombre</Label>
              <Input id="nuevo-producto-nombre" autoFocus value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Frijol" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Categoría</Label>
              <div className="flex gap-2">
                <Select
                  items={Object.fromEntries((categorias ?? []).map((c) => [String(c.id), c.nombre]))}
                  value={categoriaId ? String(categoriaId) : undefined}
                  onValueChange={(value) => setCategoriaId(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias?.map((categoria) => (
                      <SelectItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setNuevaCategoriaAbierta(true)} title="Nueva categoría">
                  <Plus />
                </Button>
              </div>
            </div>
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
      <NuevaCategoriaDialog open={nuevaCategoriaAbierta} onOpenChange={setNuevaCategoriaAbierta} onCreada={(categoria) => setCategoriaId(categoria.id)} />
    </>
  );
}
