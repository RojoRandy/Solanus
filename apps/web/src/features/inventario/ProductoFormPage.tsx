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
import { useActualizarProducto, useCategorias, useCrearProducto, useProducto } from './api';

const schema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre del producto'),
  codigoBarras: z.string().trim().optional(),
  categoriaId: z.coerce.number({ message: 'Selecciona una categoría' }).int().positive(),
});

type FormValues = z.infer<typeof schema>;

export function ProductoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const productoId = id ? Number(id) : undefined;

  const { data: producto, isLoading: cargandoProducto } = useProducto(productoId);
  const { data: categorias, isLoading: cargandoCategorias } = useCategorias();

  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '' },
  });

  useEffect(() => {
    if (producto) {
      reset({
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarras ?? undefined,
        categoriaId: producto.categoria.id,
      });
    }
  }, [producto, reset]);

  const categoriaId = watch('categoriaId');

  async function onSubmit(values: FormValues) {
    try {
      if (esEdicion && productoId) {
        await actualizar.mutateAsync({ id: productoId, dto: values });
        toast.success('Producto actualizado');
      } else {
        await crear.mutateAsync(values);
        toast.success('Producto creado');
      }
      navigate('/inventario/productos');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el producto');
    }
  }

  const cargando = (esEdicion && cargandoProducto) || cargandoCategorias;

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
          <p className="text-sm text-muted-foreground">
            Marca, unidad, presentación y estado (crudo/cocido) se capturan al registrar cada entrada
          </p>
        </div>
      </div>

      <Card className="max-w-lg animate-in fade-in slide-in-from-bottom-1">
        <CardHeader>
          <CardTitle>Información del producto</CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Frijol" />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Categoría</Label>
                <Select
                  items={Object.fromEntries((categorias ?? []).map((c) => [String(c.id), c.nombre]))}
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
                <Label htmlFor="codigoBarras">Código de barras</Label>
                <Input id="codigoBarras" {...register('codigoBarras')} placeholder="Opcional" />
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
