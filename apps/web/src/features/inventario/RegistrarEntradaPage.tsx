import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Info, Plus } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { hoyISO } from '@/lib/fecha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker } from '@/components/ui/date-picker';
import { useBienhechores } from '@/features/bienhechores/api';
import { NuevoBienhechorDialog } from '@/features/bienhechores/components/NuevoBienhechorDialog';
import { ComboboxField } from './ComboboxField';
import { NuevoProductoDialog } from './components/NuevoProductoDialog';
import { useProducto, useProductos, useRegistrarEntrada } from './api';
import { etiquetaMarcaLote, etiquetaProducto } from './format';
import { ETIQUETA_ESTADO, type OrigenLote, type Producto } from './types';

const schema = z
  .object({
    productoId: z.number().optional(),
    cantidadInicial: z.coerce.number({ message: 'Indica la cantidad' }).positive('Debe ser mayor a cero'),
    costoUnitario: z.coerce.number({ message: 'Indica el costo unitario' }).positive('Debe ser mayor a cero'),
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
    if (!data.productoId) {
      ctx.addIssue({ code: 'custom', path: ['productoId'], message: 'Selecciona un producto' });
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

  // ponytail: limit fijo, pasar a búsqueda remota si el catálogo crece más de 500
  const { data: productosPag } = useProductos({ limit: 500 });
  const { data: bienhechores } = useBienhechores();
  const registrarEntrada = useRegistrarEntrada();

  const [nuevoProductoAbierto, setNuevoProductoAbierto] = useState(false);
  const [productoCreado, setProductoCreado] = useState<Producto>();
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
      noCaduca: false,
      fechaIngreso: hoyISO(),
      origen: 'COMPRADO',
    },
  });

  const productoId = watch('productoId');
  const { data: producto } = useProducto(productoId);
  const cantidadInicial = watch('cantidadInicial');
  const costoUnitario = watch('costoUnitario');
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

  const opcionesProductos = useMemo(() => {
    const productos = productosPag?.items ?? [];
    const opciones = productos.map((producto) => ({ value: producto.id, label: etiquetaProducto(producto) }));
    if (productoCreado && !productos.some((producto) => producto.id === productoCreado.id)) {
      opciones.push({ value: productoCreado.id, label: etiquetaProducto(productoCreado) });
    }
    return opciones;
  }, [productosPag, productoCreado]);
  const opcionesBienhechores = useMemo(
    () => (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre })),
    [bienhechores],
  );

  async function onSubmit(values: FormValues) {
    try {
      await registrarEntrada.mutateAsync({
        productoId: values.productoId,
        cantidadInicial: values.cantidadInicial,
        costoUnitario: values.costoUnitario,
        costoTotal,
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
            <div className="flex flex-col gap-1.5">
              <Label>Producto</Label>
              <div className="flex gap-2">
                <ComboboxField
                  options={opcionesProductos}
                  value={productoId}
                  onValueChange={(value) => setValue('productoId', value, { shouldValidate: true })}
                  placeholder="Buscar producto por nombre…"
                  emptyText="No hay productos que coincidan"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setNuevoProductoAbierto(true)} title="Nuevo producto">
                  <Plus />
                </Button>
              </div>
              {errors.productoId && <p className="text-xs text-destructive">{errors.productoId.message}</p>}
            </div>

            {productoId && producto && (
              <dl className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Unidad</dt>
                  <dd>{producto.unidad.nombre} ({producto.unidad.abrevia})</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Crudo/cocido</dt>
                  <dd>{ETIQUETA_ESTADO[producto.estado]}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Marca</dt>
                  <dd>{etiquetaMarcaLote(producto)}</dd>
                </div>
                {producto.contenido && (
                  <div>
                    <dt className="text-muted-foreground">Contenido</dt>
                    <dd>{producto.contenido.cantidad} {producto.contenido.unidad.abrevia}</dd>
                  </div>
                )}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-1">
          <CardHeader>
            <CardTitle>Datos del lote</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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

      <NuevoProductoDialog
        open={nuevoProductoAbierto}
        onOpenChange={setNuevoProductoAbierto}
        onCreado={(producto) => {
          setProductoCreado(producto);
          setValue('productoId', producto.id, { shouldValidate: true, shouldDirty: true });
        }}
      />
      <NuevoBienhechorDialog
        open={nuevoBienhechorAbierto}
        onOpenChange={setNuevoBienhechorAbierto}
        onCreado={(bienhechor) => setValue('bienhechorId', bienhechor.id, { shouldValidate: true })}
      />
    </div>
  );
}
