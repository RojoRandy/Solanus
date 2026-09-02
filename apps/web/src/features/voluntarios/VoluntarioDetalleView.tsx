import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserRoles } from '@comedor-solanus/shared';
import { ArrowLeft, Camera, Pencil, Phone, Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { resolveFotoUrl, voluntariosApi } from './api';

function mensajeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export function VoluntarioDetalleView() {
  const { id } = useParams<{ id: string }>();
  const voluntarioId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const esAdministrador = user?.rol === UserRoles.ADMINISTRADOR;

  const fotoInputRef = React.useRef<HTMLInputElement>(null);
  const [eliminarAbierto, setEliminarAbierto] = React.useState(false);

  const voluntarioQuery = useQuery({
    queryKey: ['voluntarios', voluntarioId],
    queryFn: () => voluntariosApi.obtener(voluntarioId),
    enabled: Number.isInteger(voluntarioId),
  });

  const subirFotoMutation = useMutation({
    mutationFn: (file: File) => voluntariosApi.subirFoto(voluntarioId, file),
    onSuccess: (voluntario) => {
      queryClient.setQueryData(['voluntarios', voluntarioId], voluntario);
      void queryClient.invalidateQueries({ queryKey: ['voluntarios'], exact: false });
      toast.success('Fotografía actualizada');
    },
    onError: (error) => {
      toast.error('No se pudo subir la fotografía', { description: mensajeError(error) });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: () => voluntariosApi.eliminar(voluntarioId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['voluntarios'], exact: false });
      toast.success('Voluntario dado de baja');
      navigate('/voluntarios', { replace: true });
    },
    onError: (error) => {
      toast.error('No se pudo dar de baja al voluntario', { description: mensajeError(error) });
      setEliminarAbierto(false);
    },
  });

  if (!Number.isInteger(voluntarioId)) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="Voluntario no válido"
        action={
          <Button variant="outline" render={<Link to="/voluntarios" />}>
            Volver al listado
          </Button>
        }
      />
    );
  }

  if (voluntarioQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Card className="max-w-xl">
          <CardContent className="flex items-center gap-4 pt-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (voluntarioQuery.isError || !voluntarioQuery.data) {
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

  const voluntario = voluntarioQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link to="/voluntarios" />} aria-label="Volver">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {voluntario.nombres} {voluntario.apellidos}
        </h1>
      </div>

      <Card className="max-w-xl">
        <CardContent className="flex flex-col gap-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {voluntario.fotoPath ? (
                <img
                  src={resolveFotoUrl(voluntario.fotoPath)}
                  alt={`${voluntario.nombres} ${voluntario.apellidos}`}
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                  {voluntario.nombres.charAt(0)}
                  {voluntario.apellidos.charAt(0)}
                </div>
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -right-1 -bottom-1 rounded-full"
                aria-label={voluntario.fotoPath ? 'Reemplazar fotografía' : 'Subir fotografía'}
                disabled={subirFotoMutation.isPending}
                onClick={() => fotoInputRef.current?.click()}
              >
                <Camera />
              </Button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) subirFotoMutation.mutate(file);
                  event.target.value = '';
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Badge variant={voluntario.activo ? 'default' : 'outline'} className="w-fit">
                {voluntario.activo ? 'Activo' : 'Inactivo'}
              </Badge>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-4" />
                {voluntario.telefono}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button render={<Link to={`/voluntarios/${voluntario.id}/editar`} />}>
              <Pencil />
              Editar
            </Button>

            {esAdministrador && (
              <AlertDialog open={eliminarAbierto} onOpenChange={setEliminarAbierto}>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  <Trash2 />
                  Eliminar
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Dar de baja a este voluntario?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {voluntario.nombres} {voluntario.apellidos} dejará de aparecer como voluntario activo. Esta acción se puede revertir
                      editando su registro más adelante.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      disabled={eliminarMutation.isPending}
                      onClick={() => eliminarMutation.mutate()}
                    >
                      {eliminarMutation.isPending ? 'Eliminando…' : 'Sí, dar de baja'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
