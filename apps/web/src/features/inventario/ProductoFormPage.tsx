import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useActualizarInventarioItem,
  useCategorias,
  useCrearInventarioItem,
  useInventarioItem,
  useUbicaciones,
  useUnidades,
} from './api';

const schema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre del producto'),
  marca: z.string().trim().optional(),
  codigoBarras: z.string().trim().optional(),
  categoriaId: z.coerce.number({ message: 'Selecciona una categoría' }).int().positive(),
  unidadId: z.coerce.number({ message: 'Selecciona una unidad' }).int().positive(),
  presentacion: z.string().trim().optional(),
  ubicacionId: z.coerce.number().int().positive().optional(),
  stockMinimo: z.coerce.number().min(0, 'No puede ser negativo').optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProductoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const itemId = id ? Number(id) : undefined;

  const { data: item, isLoading: cargandoItem } = useInventarioItem(itemId);
  const { data: categorias, isLoading: cargandoCategorias } = useCategorias();
  const { data: unidades, isLoading: cargandoUnidades } = useUnidades();
  const { data: ubicaciones } = useUbicaciones();

  const crear = useCrearInventarioItem();
  const actualizar = useActualizarInventarioItem();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', stockMinimo: 0 },
  });

  useEffect(() => {
    if (item) {
      reset({
        nombre: item.nombre,
        marca: item.marca ?? undefined,
        codigoBarras: item.codigoBarras ?? undefined,
        categoriaId: item.categoria.id,
        unidadId: item.unidad.id,
        presentacion: item.presentacion ?? undefined,
        ubicacionId: item.ubicacion?.id,
        stockMinimo: item.stockMinimo,
      });
    }
  }, [item, reset]);

  const categoriaId = watch('categoriaId');
  const unidadId = watch('unidadId');
  const ubicacionId = watch('ubicacionId');

  async function onSubmit(values: FormValues) {
    try {
      if (esEdicion && itemId) {
        await actualizar.mutateAsync({ id: itemId, dto: values });
        toast.success('Producto actualizado');
      } else {
        await crear.mutateAsync(values);
        toast.success('Producto creado');
      }
      navigate('/inventario');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el producto');
    }
  }

  const cargando = (esEdicion && cargandoItem) || cargandoCategorias || cargandoUnidades;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-sm text-muted-foreground">Datos del producto en el catálogo de inventario</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del producto</CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" {...register('nombre')} placeholder="Frijol bayo" />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" {...register('marca')} placeholder="Opcional" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={categoriaId ? String(categoriaId) : undefined}
                    onValueChange={(value) => setValue('categoriaId', Number(value), { shouldValidate: true })}
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
                  {errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unidad de medida</Label>
                  <Select
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
                  {errors.unidadId && <p className="text-xs text-destructive">{errors.unidadId.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="presentacion">Presentación</Label>
                  <Input id="presentacion" {...register('presentacion')} placeholder="Bolsa de 1kg" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Ubicación</Label>
                  <Select
                    value={ubicacionId ? String(ubicacionId) : undefined}
                    onValueChange={(value) => setValue('ubicacionId', Number(value), { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {ubicaciones?.map((ubicacion) => (
                        <SelectItem key={ubicacion.id} value={String(ubicacion.id)}>
                          {ubicacion.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:max-w-52">
                <Label htmlFor="stockMinimo">Stock mínimo</Label>
                <Input id="stockMinimo" type="number" step="any" min={0} {...register('stockMinimo')} />
                {errors.stockMinimo && <p className="text-xs text-destructive">{errors.stockMinimo.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => void navigate(-1)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {esEdicion ? 'Guardar cambios' : 'Crear producto'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
