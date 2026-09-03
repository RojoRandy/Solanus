import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Info, Plus } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker } from '@/components/ui/date-picker';
import { useBienhechores } from '@/features/bienhechores/api';
import { NuevoBienhechorDialog } from '@/features/bienhechores/components/NuevoBienhechorDialog';
import { ComboboxField } from './ComboboxField';
import { NuevaCategoriaDialog } from './components/NuevaCategoriaDialog';
import { NuevaUnidadDialog } from './components/NuevaUnidadDialog';
import { useCategorias, useProductos, useRegistrarEntrada, useUnidades } from './api';
import type { EstadoProducto, OrigenLote } from './types';

const hoyISO = () => new Date().toISOString().slice(0, 10);

const schema = z
  .object({
    origenProducto: z.enum(['existente', 'nuevo']),
    productoId: z.number().optional(),
    productoNuevoNombre: z.string().trim().optional(),
    productoNuevoCategoriaId: z.number().optional(),
    productoNuevoCodigoBarras: z.string().trim().optional(),
    estado: z.enum(['CRUDO', 'COCIDO', 'NO_APLICA']),
    cantidadInicial: z.coerce.number({ message: 'Indica la cantidad' }).positive('Debe ser mayor a cero'),
    costoUnitario: z.coerce.number({ message: 'Indica el costo unitario' }).positive('Debe ser mayor a cero'),
    unidadId: z.number({ message: 'Selecciona una unidad' }),
    marca: z.string().trim().optional(),
    cfdi: z.string().trim().optional(),
    noCaduca: z.boolean(),
    fechaCaducidad: z.string().optional(),
    fechaIngreso: z.string().optional(),
    origen: z.enum(['COMPRADO', 'DONADO']),
    bienhechorId: z.number().optional(),
    presentacion: z.string().trim().optional(),
    ubicacion: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.origenProducto === 'existente' && !data.productoId) {
      ctx.addIssue({ code: 'custom', path: ['productoId'], message: 'Selecciona un producto' });
    }
    if (data.origenProducto === 'nuevo' && (!data.productoNuevoNombre || !data.productoNuevoCategoriaId)) {
      ctx.addIssue({ code: 'custom', path: ['productoNuevoNombre'], message: 'Indica nombre y categoría del producto nuevo' });
    }
    if (!data.noCaduca && !data.fechaCaducidad) {
      ctx.addIssue({ code: 'custom', path: ['fechaCaducidad'], message: 'Indica la fecha o marca "No caduca"' });
    }
    if (data.origen === 'DONADO' && !data.bienhechorId) {
      ctx.addIssue({ code: 'custom', path: ['bienhechorId'], message: 'Selecciona el bienhechor' });
    }
  });

type FormValues = z.infer<typeof schema>;

export function RegistrarEntradaPage() {
  const navigate = useNavigate();

  const { data: productosPag } = useProductos({ limit: 200 });
  const { data: categorias } = useCategorias();
  const { data: unidades } = useUnidades();
  const { data: bienhechores } = useBienhechores();
  const registrarEntrada = useRegistrarEntrada();

  const [nuevaCategoriaAbierta, setNuevaCategoriaAbierta] = useState(false);
  const [nuevaUnidadAbierta, setNuevaUnidadAbierta] = useState(false);
  const [nuevoBienhechorAbierto, setNuevoBienhechorAbierto] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      origenProducto: 'existente',
      estado: 'CRUDO',
      noCaduca: false,
      fechaIngreso: hoyISO(),
      origen: 'COMPRADO',
    },
  });

  const origenProducto = watch('origenProducto');
  const productoId = watch('productoId');
  const productoNuevoCategoriaId = watch('productoNuevoCategoriaId');
  const estado = watch('estado');
  const cantidadInicial = watch('cantidadInicial');
  const costoUnitario = watch('costoUnitario');
  const unidadId = watch('unidadId');
  const noCaduca = watch('noCaduca');
  const fechaCaducidad = watch('fechaCaducidad');
  const fechaIngreso = watch('fechaIngreso');
  const origen = watch('origen');
  const bienhechorId = watch('bienhechorId');

  const costoTotal = useMemo(() => {
    const cantidad = Number(cantidadInicial);
    const costo = Number(costoUnitario);
    if (!cantidad || !costo) return undefined;
    return Math.round(cantidad * costo * 100) / 100;
  }, [cantidadInicial, costoUnitario]);

  useEffect(() => {
    if (estado === 'COCIDO') setValue('marca', '');
  }, [estado, setValue]);

  const opcionesProductos = useMemo(
    () => (productosPag?.items ?? []).map((producto) => ({ value: producto.id, label: producto.nombre })),
    [productosPag],
  );
  const opcionesBienhechores = useMemo(
    () => (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre })),
    [bienhechores],
  );

  async function onSubmit(values: FormValues) {
    try {
      await registrarEntrada.mutateAsync({
        productoId: values.origenProducto === 'existente' ? values.productoId : undefined,
        productoNuevo:
          values.origenProducto === 'nuevo'
            ? {
                nombre: values.productoNuevoNombre!,
                categoriaId: values.productoNuevoCategoriaId!,
                codigoBarras: values.productoNuevoCodigoBarras || undefined,
              }
            : undefined,
        estado: values.estado as EstadoProducto,
        cantidadInicial: values.cantidadInicial,
        costoUnitario: values.costoUnitario,
        costoTotal,
        unidadId: values.unidadId,
        marca: values.estado === 'COCIDO' ? undefined : values.marca || undefined,
        cfdi: values.cfdi || undefined,
        fechaCaducidad: values.noCaduca ? undefined : values.fechaCaducidad,
        noCaduca: values.noCaduca,
        fechaIngreso: values.fechaIngreso || undefined,
        origen: values.origen as OrigenLote,
        bienhechorId: values.origen === 'DONADO' ? values.bienhechorId : undefined,
        presentacion: values.presentacion || undefined,
        ubicacion: values.ubicacion || undefined,
      });
      toast.success('Entrada registrada correctamente');
      navigate('/inventario');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar la entrada');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Registrar entrada</h1>
          <p className="text-sm text-muted-foreground">Da de alta un nuevo lote de inventario (compra o donación)</p>
        </div>
      </div>

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex max-w-2xl flex-col gap-4">
        <Card className="animate-in fade-in slide-in-from-bottom-1">
          <CardHeader>
            <CardTitle>Producto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={origenProducto} onValueChange={(value) => setValue('origenProducto', value as 'existente' | 'nuevo')}>
              <TabsList>
                <TabsTrigger value="existente">Producto existente</TabsTrigger>
                <TabsTrigger value="nuevo">Producto nuevo</TabsTrigger>
              </TabsList>
            </Tabs>

            {origenProducto === 'existente' ? (
              <div className="flex flex-col gap-1.5">
                <Label>Producto</Label>
                <ComboboxField
                  options={opcionesProductos}
                  value={productoId}
                  onValueChange={(value) => setValue('productoId', value, { shouldValidate: true })}
                  placeholder="Buscar producto por nombre…"
                  emptyText="No hay productos que coincidan"
                />
                {errors.productoId && <p className="text-xs text-destructive">{errors.productoId.message}</p>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="productoNuevoNombre">Nombre del producto</Label>
                  <Input id="productoNuevoNombre" {...register('productoNuevoNombre')} placeholder="Frijol bayo" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label>Categoría</Label>
                  <div className="flex gap-2">
                    <Select
                      items={Object.fromEntries((categorias ?? []).map((c) => [String(c.id), c.nombre]))}
                      value={productoNuevoCategoriaId ? String(productoNuevoCategoriaId) : undefined}
                      onValueChange={(value) => setValue('productoNuevoCategoriaId', Number(value), { shouldValidate: true })}
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
                  {errors.productoNuevoNombre && <p className="text-xs text-destructive">{errors.productoNuevoNombre.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="productoNuevoCodigoBarras">Código de barras</Label>
                  <Input id="productoNuevoCodigoBarras" {...register('productoNuevoCodigoBarras')} placeholder="Opcional" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-1">
          <CardHeader>
            <CardTitle>Datos del lote</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Crudo o cocido</Label>
              <Select
                items={{ CRUDO: 'Crudo', COCIDO: 'Cocido', NO_APLICA: 'No aplica' }}
                value={estado}
                onValueChange={(value) => setValue('estado', value as EstadoProducto)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRUDO">Crudo</SelectItem>
                  <SelectItem value="COCIDO">Cocido</SelectItem>
                  <SelectItem value="NO_APLICA">No aplica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cantidadInicial">Cantidad</Label>
                <Input id="cantidadInicial" type="number" step="any" min={0} {...register('cantidadInicial')} placeholder="0" />
                {errors.cantidadInicial && <p className="text-xs text-destructive">{errors.cantidadInicial.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="costoUnitario">Costo unitario</Label>
                <Input id="costoUnitario" type="number" step="any" min={0} {...register('costoUnitario')} placeholder="0.00" />
                {errors.costoUnitario && <p className="text-xs text-destructive">{errors.costoUnitario.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:max-w-52">
              <Label className="gap-1">
                Costo total
                <Tooltip>
                  <TooltipTrigger render={<Info className="size-3.5 text-muted-foreground" />} />
                  <TooltipContent>Se calcula como cantidad × costo unitario.</TooltipContent>
                </Tooltip>
              </Label>
              <Input readOnly disabled value={costoTotal !== undefined ? costoTotal.toFixed(2) : ''} placeholder="—" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Unidad de medida</Label>
                <div className="flex gap-2">
                  <Select
                    items={Object.fromEntries((unidades ?? []).map((u) => [String(u.id), `${u.nombre} (${u.abrevia})`]))}
                    value={unidadId ? String(unidadId) : undefined}
                    onValueChange={(value) => setValue('unidadId', Number(value), { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades?.map((unidad) => (
                        <SelectItem key={unidad.id} value={String(unidad.id)}>
                          {unidad.nombre} ({unidad.abrevia})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setNuevaUnidadAbierta(true)} title="Nueva unidad">
                    <Plus />
                  </Button>
                </div>
                {errors.unidadId && <p className="text-xs text-destructive">{errors.unidadId.message}</p>}
              </div>
              {estado !== 'COCIDO' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" {...register('marca')} placeholder="Opcional" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:max-w-72">
              <Label htmlFor="cfdi" className="gap-1">
                CFDI (número de factura)
                <Tooltip>
                  <TooltipTrigger render={<Info className="size-3.5 text-muted-foreground" />} />
                  <TooltipContent>Folio fiscal de la factura, si aplica.</TooltipContent>
                </Tooltip>
              </Label>
              <Input id="cfdi" {...register('cfdi')} placeholder="Opcional" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Fecha de caducidad</Label>
                <DatePicker value={fechaCaducidad} onChange={(value) => setValue('fechaCaducidad', value, { shouldValidate: true })} disabled={noCaduca} />
                <label className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={noCaduca} onCheckedChange={(checked) => setValue('noCaduca', Boolean(checked), { shouldValidate: true })} />
                  No caduca
                </label>
                {errors.fechaCaducidad && <p className="text-xs text-destructive">{errors.fechaCaducidad.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha de ingreso</Label>
                <DatePicker value={fechaIngreso} onChange={(value) => setValue('fechaIngreso', value)} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Origen</Label>
                <Select
                  items={{ COMPRADO: 'Comprado', DONADO: 'Donado' }}
                  value={origen}
                  onValueChange={(value) => setValue('origen', value as 'COMPRADO' | 'DONADO')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPRADO">Comprado</SelectItem>
                    <SelectItem value="DONADO">Donado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {origen === 'DONADO' && (
                <div className="flex flex-col gap-1.5">
                  <Label>Bienhechor</Label>
                  <div className="flex gap-2">
                    <ComboboxField
                      options={opcionesBienhechores}
                      value={bienhechorId}
                      onValueChange={(value) => setValue('bienhechorId', value, { shouldValidate: true })}
                      placeholder="Buscar bienhechor por nombre…"
                      emptyText="No hay bienhechores que coincidan"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setNuevoBienhechorAbierto(true)} title="Nuevo bienhechor">
                      <Plus />
                    </Button>
                  </div>
                  {errors.bienhechorId && <p className="text-xs text-destructive">{errors.bienhechorId.message}</p>}
                </div>
              )}
            </div>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="presentacion">Presentación</Label>
                <Input id="presentacion" {...register('presentacion')} placeholder="Opcional — bolsa de 1kg" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input id="ubicacion" {...register('ubicacion')} placeholder="Opcional — Almacén, Cocina…" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => void navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Registrar entrada
          </Button>
        </div>
      </form>

      <NuevaCategoriaDialog
        open={nuevaCategoriaAbierta}
        onOpenChange={setNuevaCategoriaAbierta}
        onCreada={(categoria) => setValue('productoNuevoCategoriaId', categoria.id, { shouldValidate: true })}
      />
      <NuevaUnidadDialog
        open={nuevaUnidadAbierta}
        onOpenChange={setNuevaUnidadAbierta}
        onCreada={(unidad) => setValue('unidadId', unidad.id, { shouldValidate: true })}
      />
      <NuevoBienhechorDialog
        open={nuevoBienhechorAbierto}
        onOpenChange={setNuevoBienhechorAbierto}
        onCreado={(bienhechor) => setValue('bienhechorId', bienhechor.id, { shouldValidate: true })}
      />
    </div>
  );
}
