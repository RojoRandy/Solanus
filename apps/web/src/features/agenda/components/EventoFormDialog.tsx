import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { COLOR_EVENTO_DEFAULT, colorEventoRegex } from '@comedor-solanus/shared';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker, fechaAIso } from '@/components/ui/date-picker';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { ApiError } from '@/lib/api-client';
import { useActualizarEvento, useCrearEvento } from '../api';
import type { EventoAgenda } from '../types';

const schema = z.object({
  fecha: z.string().min(1, 'Indica la fecha'),
  hora: z.string().min(1, 'Indica la hora'),
  descripcion: z.string().trim().min(1, 'Indica la descripción').max(300, 'Máximo 300 caracteres'),
  color: z.string().regex(colorEventoRegex, 'Elige un color válido'),
});

type FormValues = z.infer<typeof schema>;

interface EventoFormDialogProps {
  evento: EventoAgenda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fechaYHoraDeEvento(fechaHora: string): { fecha: string; hora: string } {
  const fecha = new Date(fechaHora);
  return { fecha: fechaAIso(fecha), hora: format(fecha, 'HH:mm') };
}

function combinarFechaHora(fecha: string, hora: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas, minutos] = hora.split(':').map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos).toISOString();
}

const VALORES_VACIOS: FormValues = { fecha: '', hora: '', descripcion: '', color: COLOR_EVENTO_DEFAULT };

export function EventoFormDialog({ evento, open, onOpenChange }: EventoFormDialogProps) {
  const esEdicion = evento !== null;
  const crear = useCrearEvento();
  const actualizar = useActualizarEvento();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: VALORES_VACIOS,
  });

  useEffect(() => {
    if (open) {
      reset(evento ? { ...fechaYHoraDeEvento(evento.fechaHora), descripcion: evento.descripcion, color: evento.color } : VALORES_VACIOS);
    }
  }, [open, evento, reset]);

  const fecha = watch('fecha');
  const color = watch('color');

  async function onSubmit(values: FormValues) {
    if (!esEdicion && values.fecha < fechaAIso(new Date())) {
      toast.error('La fecha no puede ser anterior a hoy.');
      return;
    }
    const dto = {
      fechaHora: combinarFechaHora(values.fecha, values.hora),
      descripcion: values.descripcion,
      color: values.color,
    };
    try {
      if (esEdicion && evento) {
        await actualizar.mutateAsync({ id: evento.id, dto });
        toast.success('Evento actualizado');
      } else {
        await crear.mutateAsync(dto);
        toast.success('Evento creado');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar el evento');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evento-fecha">Fecha</Label>
              <DatePicker id="evento-fecha" value={fecha} onChange={(value) => setValue('fecha', value ?? '', { shouldValidate: true })} />
              {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evento-hora">Hora</Label>
              <Input id="evento-hora" type="time" {...register('hora')} />
              {errors.hora && <p className="text-xs text-destructive">{errors.hora.message}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evento-descripcion">Descripción</Label>
            <Textarea id="evento-descripcion" {...register('descripcion')} autoFocus />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evento-color">Color de etiqueta</Label>
            <ColorPicker id="evento-color" value={color} onChange={(hex) => setValue('color', hex, { shouldValidate: true })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {esEdicion ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
