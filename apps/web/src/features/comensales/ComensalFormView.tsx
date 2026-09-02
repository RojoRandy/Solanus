import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AlertCircle, CalendarIcon, Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { useActualizarComensal, useComensal, useCrearComensal } from './api';
import { TutorCombobox } from './components/TutorCombobox';
import { calcularEdad, formatearFecha } from './utils/edad';

const comensalSchema = z
  .object({
    nombres: z.string().trim().min(1, 'Los nombres son obligatorios'),
    apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios'),
    fechaNacimiento: z.date({
      required_error: 'La fecha de nacimiento es obligatoria',
      invalid_type_error: 'La fecha de nacimiento es obligatoria',
    }),
    curp: z.string().trim().optional(),
    tutorId: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (calcularEdad(data.fechaNacimiento) < 18 && !data.tutorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tutorId'],
        message: 'El comensal es menor de edad: selecciona un tutor',
      });
    }
  });

type ComensalFormValues = z.infer<typeof comensalSchema>;

function fechaISOSinHora(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function ComensalFormView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const comensalId = id ? Number(id) : undefined;
  const esEdicion = comensalId !== undefined;

  const {
    data: comensalExistente,
    isLoading: cargandoComensal,
    isError: errorCargandoComensal,
  } = useComensal(comensalId);

  const crearComensal = useCrearComensal();
  const actualizarComensal = useActualizarComensal(comensalId ?? -1);
  const guardando = crearComensal.isPending || actualizarComensal.isPending;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ComensalFormValues>({
    resolver: zodResolver(comensalSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      curp: '',
      tutorId: null,
    },
  });

  React.useEffect(() => {
    if (!comensalExistente) return;
    reset({
      nombres: comensalExistente.nombres,
      apellidos: comensalExistente.apellidos,
      fechaNacimiento: new Date(comensalExistente.fechaNacimiento),
      curp: comensalExistente.curp ?? '',
      tutorId: comensalExistente.tutor?.id ?? null,
    });
  }, [comensalExistente, reset]);

  const fechaNacimiento = useWatch({ control, name: 'fechaNacimiento' });
  const tutorId = useWatch({ control, name: 'tutorId' });
  const esMenor = fechaNacimiento ? calcularEdad(fechaNacimiento) < 18 : false;

  React.useEffect(() => {
    if (!esMenor && tutorId) setValue('tutorId', null);
  }, [esMenor, tutorId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
      fechaNacimiento: fechaISOSinHora(values.fechaNacimiento),
      curp: values.curp?.trim() || undefined,
      tutorId: esMenor ? (values.tutorId ?? null) : null,
    };

    try {
      if (esEdicion && comensalId) {
        const actualizado = await actualizarComensal.mutateAsync(payload);
        toast.success('Comensal actualizado correctamente');
        navigate(`/comensales/${actualizado.id}`);
      } else {
        const creado = await crearComensal.mutateAsync(payload);
        toast.success('Comensal registrado correctamente');
        navigate(`/comensales/${creado.id}`);
      }
    } catch (error) {
      const mensaje = error instanceof ApiError ? error.message : 'Ocurrió un error inesperado';
      toast.error(mensaje);
    }
  });

  if (esEdicion && cargandoComensal) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (esEdicion && errorCargandoComensal) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No se pudo cargar el comensal"
        description="Verifica tu conexión e intenta de nuevo."
        action={
          <Button variant="outline" onClick={() => navigate('/comensales')}>
            Volver al listado
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {esEdicion ? 'Editar comensal' : 'Nuevo comensal'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {esEdicion
            ? 'Actualiza los datos del expediente del comensal.'
            : 'Registra los datos básicos para abrir su expediente.'}
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Datos del comensal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombres">Nombres</Label>
                <Input id="nombres" {...register('nombres')} aria-invalid={!!errors.nombres} />
                {errors.nombres && (
                  <p className="text-sm text-destructive">{errors.nombres.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  {...register('apellidos')}
                  aria-invalid={!!errors.apellidos}
                />
                {errors.apellidos && (
                  <p className="text-sm text-destructive">{errors.apellidos.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Fecha de nacimiento</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start font-normal sm:w-64',
                        !fechaNacimiento && 'text-muted-foreground',
                      )}
                    />
                  }
                >
                  <CalendarIcon data-icon="inline-start" />
                  {fechaNacimiento ? formatearFecha(fechaNacimiento) : 'Selecciona una fecha'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={fechaNacimiento}
                    onSelect={(fecha) => fecha && setValue('fechaNacimiento', fecha)}
                    disabled={{ after: new Date() }}
                    defaultMonth={fechaNacimiento ?? new Date()}
                  />
                </PopoverContent>
              </Popover>
              {fechaNacimiento && (
                <p className="text-sm text-muted-foreground">
                  {calcularEdad(fechaNacimiento)} años {esMenor && '— menor de edad'}
                </p>
              )}
              {errors.fechaNacimiento && (
                <p className="text-sm text-destructive">{errors.fechaNacimiento.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:w-64">
              <Label htmlFor="curp">CURP (opcional)</Label>
              <Input id="curp" {...register('curp')} maxLength={18} />
            </div>

            {esMenor && (
              <div className="flex flex-col gap-1.5">
                <Label>Tutor</Label>
                <TutorCombobox
                  value={tutorId}
                  onChange={(nuevoTutorId) => setValue('tutorId', nuevoTutorId)}
                  excluirComensalId={comensalId}
                />
                {errors.tutorId && (
                  <p className="text-sm text-destructive">{errors.tutorId.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {esEdicion ? 'Guardar cambios' : 'Registrar comensal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
