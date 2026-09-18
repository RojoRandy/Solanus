import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useActualizarProducto, useCrearProducto, useProducto, useUnidades } from './api';

import { ProductoFormFields, type ProductoFormFieldsValue } from './components/ProductoFormFields';

export function ProductoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const productoId = id ? Number(id) : undefined;

  const { data: producto, isLoading: cargandoProducto } = useProducto(productoId);
  const { data: unidades, isLoading: cargandoUnidades } = useUnidades();

  const schema = z.object({
    nombre: z.string().trim().min(1, 'Indica el nombre del producto'),
    categoriaId: z.number({ message: 'Selecciona una categoría' }).int().positive(),
    unidadId: z.number({ message: 'Selecciona una unidad' }).int().positive(),
    estado: z.enum(['CRUDO', 'COCIDO', 'NO_APLICA']).default('NO_APLICA'),
    marca: z.string().trim().optional(),
    granel: z.boolean().default(false),
    contenidoCantidad: z.number().optional(),
    contenidoUnidadId: z.number().optional(),
  }).superRefine((data, ctx) => {
    if (unidades?.find((unidad) => unidad.id === data.unidadId)?.indicarContenido) {
      if (data.contenidoCantidad === undefined || data.contenidoCantidad <= 0) {
        ctx.addIssue({ code: 'custom', path: ['contenidoCantidad'], message: 'Indica una cantidad mayor a cero' });
      }
      if (!data.contenidoUnidadId) {
        ctx.addIssue({ code: 'custom', path: ['contenidoUnidadId'], message: 'Selecciona una unidad de contenido' });
      }
    }
  });
  type FormValues = z.infer<typeof schema>;

  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', estado: 'NO_APLICA', granel: false },
    values: producto ? {
      nombre: producto.nombre,
      categoriaId: producto.categoria.id,
      unidadId: producto.unidad.id,
      estado: producto.estado,
      marca: producto.marca ?? '',
      granel: producto.granel,
      contenidoCantidad: producto.contenido?.cantidad,
      contenidoUnidadId: producto.contenido?.unidad.id,
    } : undefined,
  });

  const valor = useWatch({ control });

  function cambiarValor(nuevoValor: ProductoFormFieldsValue) {
    function actualizarCampo(campo: keyof ProductoFormFieldsValue) {
      setValue(campo, nuevoValor[campo], { shouldDirty: true, shouldValidate: true });
    }
    (Object.keys(nuevoValor) as (keyof ProductoFormFieldsValue)[]).forEach(actualizarCampo);
  }

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

  const cargando = (esEdicion && cargandoProducto) || cargandoUnidades;

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
            Nombre, categoría, unidad, marca, contenido y si es crudo o cocido — la presentación y ubicación del lote se capturan en cada entrada
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
              <ProductoFormFields
                value={{ ...valor, nombre: valor.nombre ?? '', estado: valor.estado ?? 'NO_APLICA', granel: valor.granel ?? false }}
                onChange={cambiarValor}
                errors={Object.fromEntries(Object.entries(errors).map(([campo, error]) => [campo, error.message]))}
              />

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
