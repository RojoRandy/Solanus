import * as React from 'react';
import { toast } from 'sonner';
import { ImageOff, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { ApiError, resolverUrlArchivo } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useEliminarEvidencia, useEvidencias, useSubirEvidencia } from '../api';
import { etiquetaPeriodo, type Periodo } from '../periodo';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 5;

export function EvidenciasView({ periodo }: { periodo: Periodo }) {
  const { user } = useAuth();
  const esAdministrador = user?.rol === 'ADMINISTRADOR';
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useEvidencias(periodo);
  const subir = useSubirEvidencia(periodo);
  const eliminar = useEliminarEvidencia(periodo);

  function handleSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    e.target.value = '';

    for (const archivo of archivos) {
      if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        toast.error(`"${archivo.name}" no es una imagen JPG, PNG o WebP.`);
        continue;
      }
      if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
        toast.error(`"${archivo.name}" pesa más de ${TAMANO_MAXIMO_MB} MB.`);
        continue;
      }
      subir.mutate(archivo, {
        onError: (error) => toast.error(error instanceof ApiError ? error.message : `No se pudo subir "${archivo.name}".`),
      });
    }
  }

  function handleEliminar(id: number) {
    eliminar.mutate(id, {
      onSuccess: () => toast.success('Evidencia eliminada.'),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo eliminar la evidencia.'),
    });
  }

  const evidencias = data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Evidencias — {etiquetaPeriodo(periodo)}</h3>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleSeleccion}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload data-icon="inline-start" />
          Subir fotos
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      ) : evidencias.length === 0 ? (
        <EmptyState icon={ImageOff} title={`Sin evidencias para ${etiquetaPeriodo(periodo)}`} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {evidencias.map((evidencia) => (
            <div key={evidencia.id} className="group relative overflow-hidden rounded-lg border">
              <img
                src={resolverUrlArchivo(evidencia.rutaArchivo)}
                alt={`Evidencia de ${etiquetaPeriodo(periodo)}`}
                className="aspect-video w-full object-cover"
              />
              {esAdministrador && (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta evidencia?</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleEliminar(evidencia.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
