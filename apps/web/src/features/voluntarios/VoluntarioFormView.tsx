import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Camera, TriangleAlert, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api-client';
import { resolveFotoUrl, voluntariosApi, type Voluntario } from './api';

const voluntarioSchema = z.object({
  nombres: z.string().trim().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos numéricos, sin espacios ni guiones'),
});

type VoluntarioFormValues = z.infer<typeof voluntarioSchema>;

function mensajeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export function VoluntarioFormView() {
  const { id } = useParams<{ id: string }>();
  const esEdicion = Boolean(id);
  const voluntarioId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [foto, setFoto] = React.useState<File | null>(null);
  const previewUrl = React.useMemo(() => (foto ? URL.createObjectURL(foto) : undefined), [foto]);

  const voluntarioQuery = useQuery({
    queryKey: ['voluntarios', voluntarioId],
    queryFn: () => voluntariosApi.obtener(voluntarioId as number),
    enabled: esEdicion,
  });

  const form = useForm<VoluntarioFormValues>({
    resolver: zodResolver(voluntarioSchema),
    defaultValues: { nombres: '', apellidos: '', telefono: '' },
  });

  React.useEffect(() => {
    if (voluntarioQuery.data) {
      form.reset({
        nombres: voluntarioQuery.data.nombres,
        apellidos: voluntarioQuery.data.apellidos,
        telefono: voluntarioQuery.data.telefono,
      });
    }
  }, [voluntarioQuery.data, form]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function guardarFoto(destino: Voluntario) {
    if (!foto) return destino;
    try {
      return await voluntariosApi.subirFoto(destino.id, foto);
    } catch (error) {
      toast.error('El voluntario se guardó, pero la fotografía no se pudo subir', {
        description: mensajeError(error),
      });
      return destino;
    }
  }

  const guardarMutation = useMutation({
    mutationFn: async (valores: VoluntarioFormValues) => {
      const voluntario =
        esEdicion && voluntarioId
          ? await voluntariosApi.actualizar(voluntarioId, valores)
          : await voluntariosApi.crear(valores);
      return guardarFoto(voluntario);
    },
    onSuccess: (voluntario) => {
      void queryClient.invalidateQueries({ queryKey: ['voluntarios'] });
      toast.success(esEdicion ? 'Voluntario actualizado' : 'Voluntario registrado');
      navigate(`/voluntarios/${voluntario.id}`, { replace: true });
    },
    onError: (error) => {
      toast.error('No se pudo guardar el voluntario', { description: mensajeError(error) });
    },
  });

  if (esEdicion && voluntarioQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Card className="max-w-xl">
          <CardContent className="flex flex-col gap-4 pt-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (esEdicion && voluntarioQuery.isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="No se pudo cargar el voluntario"
        description={mensajeError(voluntarioQuery.error)}
        action={
          <Button variant="outline" render={<Link to="/voluntarios" />}>
            Volver al listado
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link to="/voluntarios" />} aria-label="Volver">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{esEdicion ? 'Editar voluntario' : 'Nuevo voluntario'}</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Datos del voluntario</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              void form.handleSubmit((valores) => guardarMutation.mutate(valores))(event);
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
                {previewUrl || voluntarioQuery.data?.fotoPath ? (
                  <img
                    src={previewUrl ?? resolveFotoUrl(voluntarioQuery.data?.fotoPath)}
                    alt="Vista previa de la fotografía"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="size-7" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="foto" className="w-fit cursor-pointer text-sm font-medium text-primary hover:underline">
                  <Camera className="size-4" />
                  {foto ? 'Cambiar fotografía' : 'Agregar fotografía'}
                </Label>
                <input
                  id="foto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => setFoto(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">Opcional. JPG, PNG o WEBP.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" autoFocus {...form.register('nombres')} aria-invalid={Boolean(form.formState.errors.nombres)} />
              {form.formState.errors.nombres && <p className="text-sm text-destructive">{form.formState.errors.nombres.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" {...form.register('apellidos')} aria-invalid={Boolean(form.formState.errors.apellidos)} />
              {form.formState.errors.apellidos && <p className="text-sm text-destructive">{form.formState.errors.apellidos.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                inputMode="numeric"
                placeholder="5512345678"
                {...form.register('telefono')}
                aria-invalid={Boolean(form.formState.errors.telefono)}
              />
              {form.formState.errors.telefono && <p className="text-sm text-destructive">{form.formState.errors.telefono.message}</p>}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" render={<Link to="/voluntarios" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardarMutation.isPending}>
                {guardarMutation.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
