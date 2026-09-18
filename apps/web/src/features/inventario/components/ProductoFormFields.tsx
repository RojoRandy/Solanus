import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategorias, useUnidades } from '../api';
import { ETIQUETA_ESTADO, type EstadoProducto } from '../types';
import { NuevaCategoriaDialog } from './NuevaCategoriaDialog';
import { NuevaUnidadDialog } from './NuevaUnidadDialog';

export interface ProductoFormFieldsValue {
  nombre: string;
  categoriaId?: number;
  unidadId?: number;
  estado: EstadoProducto;
  marca?: string;
  granel: boolean;
  contenidoCantidad?: number;
  contenidoUnidadId?: number;
}

interface ProductoFormFieldsProps {
  value: ProductoFormFieldsValue;
  onChange: (value: ProductoFormFieldsValue) => void;
  errors?: Partial<Record<keyof ProductoFormFieldsValue, string>>;
}

/** Campos de producto compartidos, independientes del estado y la validación del formulario. */
export function ProductoFormFields({ value, onChange, errors }: ProductoFormFieldsProps) {
  const id = useId();
  const { data: categorias } = useCategorias();
  const { data: unidades } = useUnidades();
  const [nuevaCategoriaAbierta, setNuevaCategoriaAbierta] = useState(false);
  const [nuevaUnidadAbierta, setNuevaUnidadAbierta] = useState(false);
  const indicarContenido = unidades?.find((unidad) => unidad.id === value.unidadId)?.indicarContenido;
  const opcionesUnidades = Object.fromEntries((unidades ?? []).map((unidad) => [String(unidad.id), `${unidad.nombre} (${unidad.abrevia})`]));

  function error(campo: keyof ProductoFormFieldsValue) {
    return errors?.[campo] ? <p className="text-xs text-destructive">{errors[campo]}</p> : null;
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-nombre`}>Nombre</Label>
        <Input id={`${id}-nombre`} value={value.nombre} onChange={(event) => onChange({ ...value, nombre: event.target.value })} placeholder="Frijol" />
        {error('nombre')}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-categoria`}>Categoría</Label>
        <div className="flex gap-2">
          <Select
            items={Object.fromEntries((categorias ?? []).map((categoria) => [String(categoria.id), categoria.nombre]))}
            value={value.categoriaId ? String(value.categoriaId) : null}
            onValueChange={(categoriaId) => onChange({ ...value, categoriaId: categoriaId ? Number(categoriaId) : undefined })}
          >
            <SelectTrigger id={`${id}-categoria`} className="w-full"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
            <SelectContent>
              {categorias?.map((categoria) => <SelectItem key={categoria.id} value={String(categoria.id)}>{categoria.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" onClick={() => setNuevaCategoriaAbierta(true)} title="Nueva categoría"><Plus /></Button>
        </div>
        {error('categoriaId')}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-unidad`}>Unidad de medida</Label>
        <div className="flex gap-2">
          <Select
            items={opcionesUnidades}
            value={value.unidadId ? String(value.unidadId) : null}
            onValueChange={(unidadId) => onChange({ ...value, unidadId: unidadId ? Number(unidadId) : undefined })}
          >
            <SelectTrigger id={`${id}-unidad`} className="w-full"><SelectValue placeholder="Selecciona una unidad" /></SelectTrigger>
            <SelectContent>
              {unidades?.map((unidad) => <SelectItem key={unidad.id} value={String(unidad.id)}>{unidad.nombre} ({unidad.abrevia})</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" onClick={() => setNuevaUnidadAbierta(true)} title="Nueva unidad"><Plus /></Button>
        </div>
        {error('unidadId')}
      </div>
      {indicarContenido && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-medium">Contenido</legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-contenido-cantidad`}>Contenido *</Label>
            <Input id={`${id}-contenido-cantidad`} type="number" step="any" min={0} aria-required value={value.contenidoCantidad ?? ''} onChange={(event) => onChange({ ...value, contenidoCantidad: event.target.value === '' ? undefined : Number(event.target.value) })} />
            {error('contenidoCantidad')}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-contenido-unidad`}>Unidad del contenido *</Label>
            <Select items={opcionesUnidades} value={value.contenidoUnidadId ? String(value.contenidoUnidadId) : null} onValueChange={(unidadId) => onChange({ ...value, contenidoUnidadId: unidadId ? Number(unidadId) : undefined })}>
              <SelectTrigger id={`${id}-contenido-unidad`} className="w-full" aria-required><SelectValue placeholder="Selecciona una unidad" /></SelectTrigger>
              <SelectContent>
                {unidades?.map((unidad) => <SelectItem key={unidad.id} value={String(unidad.id)}>{unidad.nombre} ({unidad.abrevia})</SelectItem>)}
              </SelectContent>
            </Select>
            {error('contenidoUnidadId')}
          </div>
        </fieldset>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-estado`}>Crudo o cocido</Label>
        <Select items={ETIQUETA_ESTADO} value={value.estado} onValueChange={(estado) => { if (estado) onChange({ ...value, estado: estado as EstadoProducto }); }}>
          <SelectTrigger id={`${id}-estado`} className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CRUDO">Crudo</SelectItem>
            <SelectItem value="COCIDO">Cocido</SelectItem>
            <SelectItem value="NO_APLICA">No aplica</SelectItem>
          </SelectContent>
        </Select>
        {error('estado')}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-marca`}>Marca</Label>
        <Input id={`${id}-marca`} value={value.marca ?? ''} disabled={value.granel} onChange={(event) => onChange({ ...value, marca: event.target.value })} placeholder="Opcional" />
        {error('marca')}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={value.granel} onCheckedChange={(checked) => onChange({ ...value, granel: Boolean(checked), marca: checked ? '' : value.marca })} />
          A granel (sin marca)
        </label>
        {error('granel')}
      </div>
      <NuevaCategoriaDialog open={nuevaCategoriaAbierta} onOpenChange={setNuevaCategoriaAbierta} onCreada={(categoria) => onChange({ ...value, categoriaId: categoria.id })} />
      <NuevaUnidadDialog open={nuevaUnidadAbierta} onOpenChange={setNuevaUnidadAbierta} onCreada={(unidad) => onChange({ ...value, unidadId: unidad.id })} />
    </>
  );
}
