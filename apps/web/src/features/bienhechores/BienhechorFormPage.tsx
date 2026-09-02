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
import { Skeleton } from '@/components/ui/skeleton';
import { useActualizarBienhechor, useBienhechor, useCrearBienhechor } from './api';

const schema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre del bienhechor'),
  contacto: z.string().trim().optional(),
  rfc: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export function BienhechorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const bienhechorId = id ? Number(id) : undefined;

  const { data: bienhechor, isLoading: cargando } = useBienhechor(bienhechorId);
  const crear = useCrearBienhechor();
  const actualizar = useActualizarBienhechor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '' },
  });

  useEffect(() => {
    if (bienhechor) {
      reset({
        nombre: bienhechor.nombre,
        contacto: bienhechor.contacto ?? undefined,
        rfc: bienhechor.rfc ?? undefined,
      });
    }
  }, [bienhechor, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (esEdicion && bienhechorId) {
        await actualizar.mutateAsync({ id: bienhechorId, dto: values });
        toast.success('Bienhechor actualizado');
      } else {
        await crear.mutateAsync(values);
        toast.success('Bienhechor creado');
      }
      navigate('/bienhechores');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el bienhechor');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {esEdicion ? 'Editar bienhechor' : 'Nuevo bienhechor'}
          </h1>
          <p className="text-sm text-muted-foreground">Datos de contacto del bienhechor</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Información del bienhechor</CardTitle>
        </CardHeader>
        <CardContent>
          {esEdicion && cargando ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register('nombre')} placeholder="Central de Abasto A.C." />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contacto">Contacto</Label>
                <Input id="contacto" {...register('contacto')} placeholder="Teléfono o correo (opcional)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rfc">RFC</Label>
                <Input id="rfc" {...register('rfc')} placeholder="Opcional" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => void navigate(-1)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {esEdicion ? 'Guardar cambios' : 'Crear bienhechor'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
