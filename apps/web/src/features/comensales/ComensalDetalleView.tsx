import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircle,
  Camera,
  Download,
  FileText,
  IdCard,
  Loader2,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { UserRoles } from '@comedor-solanus/shared';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  descargarExpedientePdf,
  resolverUrlArchivo,
  useComensal,
  useEliminarComensal,
  useFirmarCartaUsoImagen,
  useSubirFotoComensal,
  useSubirIneFrenteComensal,
  useSubirIneReversoComensal,
} from './api';
import { formatearFecha } from './utils/edad';

export function ComensalDetalleView() {
  const { id } = useParams<{ id: string }>();
  const comensalId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: comensal, isLoading, isError, refetch } = useComensal(comensalId);
  const eliminarComensal = useEliminarComensal();
  const firmarCarta = useFirmarCartaUsoImagen(comensalId);
  const subirFoto = useSubirFotoComensal(comensalId);
  const subirIneFrente = useSubirIneFrenteComensal(comensalId);
  const subirIneReverso = useSubirIneReversoComensal(comensalId);

  const [descargando, setDescargando] = React.useState(false);

  const fotoInputRef = React.useRef<HTMLInputElement>(null);
  const ineFrenteInputRef = React.useRef<HTMLInputElement>(null);
  const ineReversoInputRef = React.useRef<HTMLInputElement>(null);

  const puedeEditar = user?.rol !== UserRoles.USUARIO_SIMPLE;
  const puedeEliminar = user?.rol === UserRoles.ADMINISTRADOR;

  function manejarErrorMutacion(error: unknown, fallback: string) {
    toast.error(error instanceof ApiError ? error.message : fallback);
  }

  function subirArchivo(
    file: File | undefined,
    mutar: { mutate: (f: File, opts: { onSuccess: () => void; onError: (e: unknown) => void }) => void },
    mensajeExito: string,
    mensajeError: string,
  ) {
    if (!file) return;
    mutar.mutate(file, {
      onSuccess: () => toast.success(mensajeExito),
      onError: (error) => manejarErrorMutacion(error, mensajeError),
    });
  }

  async function handleDescargarPdf() {
    if (!comensal) return;
    setDescargando(true);
    try {
      await descargarExpedientePdf(comensal.id, comensal.folio);
    } catch (error) {
      manejarErrorMutacion(error, 'No se pudo descargar el expediente');
    } finally {
      setDescargando(false);
    }
  }

  async function handleEliminar() {
    try {
      await eliminarComensal.mutateAsync(comensalId);
      toast.success('Comensal dado de baja');
      navigate('/comensales');
    } catch (error) {
      manejarErrorMutacion(error, 'No se pudo dar de baja al comensal');
    }
  }

  function handleFirmarCarta(autoriza: boolean) {
    firmarCarta.mutate(
      { autoriza },
      {
        onSuccess: () => toast.success('Carta de uso de imagen actualizada'),
        onError: (error) => manejarErrorMutacion(error, 'No se pudo actualizar la carta de uso de imagen'),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !comensal) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No se pudo cargar el expediente"
        description="Verifica tu conexión e intenta de nuevo."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void refetch()}>
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => navigate('/comensales')}>
              Volver al listado
            </Button>
          </div>
        }
      />
    );
  }

  const esMayorDeEdad = comensal.edad >= 18;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {comensal.nombres} {comensal.apellidos}
            </h1>
            <Badge variant={comensal.activo ? 'default' : 'outline'}>
              {comensal.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Folio {comensal.folio}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void handleDescargarPdf()} disabled={descargando}>
            {descargando ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Download data-icon="inline-start" />}
            Descargar PDF del expediente
          </Button>
          {puedeEditar && (
            <Button variant="outline" onClick={() => navigate(`/comensales/${comensal.id}/editar`)}>
              <Pencil data-icon="inline-start" />
              Editar
            </Button>
          )}
          {puedeEliminar && comensal.activo && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>
                <Trash2 data-icon="inline-start" />
                Dar de baja
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Dar de baja a este comensal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    El expediente de {comensal.nombres} {comensal.apellidos} se marcará como inactivo. No se
                    elimina información; puede reactivarse más adelante si es necesario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => void handleEliminar()}>
                    Dar de baja
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Fotografía</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Avatar className="size-32">
              {comensal.fotoPath && <AvatarImage src={resolverUrlArchivo(comensal.fotoPath)} alt={comensal.nombres} />}
              <AvatarFallback className="size-32">
                <UserRound className="size-12" />
              </AvatarFallback>
            </Avatar>
            {puedeEditar && (
              <>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    subirArchivo(e.target.files?.[0], subirFoto, 'Foto actualizada', 'No se pudo subir la foto');
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fotoInputRef.current?.click()}
                  disabled={subirFoto.isPending}
                >
                  <Camera data-icon="inline-start" />
                  {comensal.fotoPath ? 'Reemplazar foto' : 'Subir foto'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Datos generales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Fecha de nacimiento" valor={formatearFecha(comensal.fechaNacimiento)} />
            <Dato etiqueta="Edad" valor={`${comensal.edad} años`} />
            <Dato etiqueta="CURP" valor={comensal.curp ?? 'No registrado'} />
            <Dato
              etiqueta="Tutor"
              valor={
                comensal.tutor ? (
                  <Link
                    to={`/comensales/${comensal.tutor.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {comensal.tutor.nombres} {comensal.tutor.apellidos} (folio {comensal.tutor.folio})
                  </Link>
                ) : (
                  'No aplica — es mayor de edad'
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      {esMayorDeEdad && (
        <Card>
          <CardHeader>
            <CardTitle>Identificación oficial (INE)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <IneLado
              titulo="Frente"
              rutaArchivo={comensal.ineFrontPath}
              puedeEditar={puedeEditar}
              subiendo={subirIneFrente.isPending}
              inputRef={ineFrenteInputRef}
              onSeleccionar={(file) =>
                subirArchivo(file, subirIneFrente, 'INE (frente) actualizado', 'No se pudo subir el INE')
              }
            />
            <IneLado
              titulo="Reverso"
              rutaArchivo={comensal.ineBackPath}
              puedeEditar={puedeEditar}
              subiendo={subirIneReverso.isPending}
              inputRef={ineReversoInputRef}
              onSeleccionar={(file) =>
                subirArchivo(file, subirIneReverso, 'INE (reverso) actualizado', 'No se pudo subir el INE')
              }
            />
          </CardContent>
        </Card>
      )}

      {comensal.menores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Menores a su cargo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {comensal.menores.map((menor) => (
              <Link
                key={menor.id}
                to={`/comensales/${menor.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                <span>
                  {menor.nombres} {menor.apellidos}
                </span>
                <span className="text-muted-foreground">Folio {menor.folio}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Carta de uso de imagen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="autoriza-uso-imagen"
              checked={comensal.cartaUsoImagen?.autoriza ?? false}
              disabled={!puedeEditar || firmarCarta.isPending}
              onCheckedChange={(checked) => handleFirmarCarta(checked === true)}
            />
            <label htmlFor="autoriza-uso-imagen" className="text-sm">
              Autoriza el uso de su imagen en materiales del comedor
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Estado actual:{' '}
            <Badge variant={comensal.cartaUsoImagen?.autoriza ? 'default' : 'outline'}>
              {comensal.cartaUsoImagen?.autoriza ? 'Autoriza' : 'No autoriza'}
            </Badge>{' '}
            {comensal.cartaUsoImagen?.fechaFirma
              ? `— firmada el ${formatearFecha(comensal.cartaUsoImagen.fechaFirma)}`
              : '— sin firma registrada'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asistencias</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="Aún no hay registro de asistencias"
            description="Disponible cuando se active el registro de Turno de comida (Fase 3)."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs tracking-wide text-muted-foreground uppercase">{etiqueta}</span>
      <span className="text-sm font-medium">{valor}</span>
    </div>
  );
}

function IneLado({
  titulo,
  rutaArchivo,
  puedeEditar,
  subiendo,
  inputRef,
  onSeleccionar,
}: {
  titulo: string;
  rutaArchivo: string | null;
  puedeEditar: boolean;
  subiendo: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSeleccionar: (file: File | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-wide text-muted-foreground uppercase">{titulo}</span>
      {rutaArchivo ? (
        <img
          src={resolverUrlArchivo(rutaArchivo)}
          alt={`INE ${titulo.toLowerCase()}`}
          className="h-32 w-full rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
          <IdCard className="size-8" />
        </div>
      )}
      {puedeEditar && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onSeleccionar(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
          >
            {rutaArchivo ? 'Reemplazar' : 'Subir'}
          </Button>
        </>
      )}
    </div>
  );
}
