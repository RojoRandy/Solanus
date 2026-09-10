import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ComboboxField } from '@/features/inventario/ComboboxField';
import { formatMoneda } from '@/features/inventario/format';
import { useBienhechores } from '@/features/bienhechores/api';
import { NuevoBienhechorDialog } from '@/features/bienhechores/components/NuevoBienhechorDialog';
import { ApiError } from '@/lib/api-client';
import { hoyISO } from '@/lib/fecha';
import { useRegistrarDonativoDinero } from '../api';
import { ETIQUETA_METODO_PAGO, type MetodoPago } from '../types';

const METODOS = Object.keys(ETIQUETA_METODO_PAGO) as MetodoPago[];

const schema = z.object({
  bienhechorId: z.number({ message: 'Selecciona el bienhechor' }),
  monto: z.coerce.number().positive('El monto debe ser mayor a cero'),
  fecha: z.string().min(1, 'Indica la fecha'),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'DEPOSITO']),
  folioRecibo: z.string().trim().max(50).optional(),
  nota: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prellena y bloquea el selector cuando se abre desde la ficha del bienhechor. */
  bienhechorId?: number;
  /** Se manda al API cuando la captura viene de la pantalla de Turno. */
  turnoId?: number;
}

export function RegistrarDonativoDineroDialog({ open, onOpenChange, bienhechorId, turnoId }: Props) {
  const { data: bienhechores } = useBienhechores();
  const registrar = useRegistrarDonativoDinero();
  const [nuevoBienhechorAbierto, setNuevoBienhechorAbierto] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: hoyISO(), metodoPago: 'EFECTIVO' },
  });

  useEffect(() => {
    if (open) {
      reset({
        fecha: hoyISO(),
        metodoPago: 'EFECTIVO',
        bienhechorId: bienhechorId ?? undefined,
        monto: undefined,
        folioRecibo: '',
        nota: '',
      });
    }
  }, [open, bienhechorId, reset]);

  const bienhechorSeleccionado = watch('bienhechorId');
  const metodoPago = watch('metodoPago');
  const fecha = watch('fecha');

  const opcionesBienhechor = (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre }));

  async function onSubmit(values: FormValues) {
    try {
      await registrar.mutateAsync({
        bienhechorId: values.bienhechorId,
        monto: values.monto,
        fecha: values.fecha,
        metodoPago: values.metodoPago,
        folioRecibo: values.folioRecibo || undefined,
        nota: values.nota || undefined,
        turnoId,
      });
      toast.success(`Donativo de ${formatMoneda(values.monto)} registrado.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el donativo.');
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar donativo en dinero</DialogTitle>
            <DialogDescription>Captura el bienhechor, el monto y la forma de pago.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Bienhechor</Label>
              <div className="flex gap-2">
                <ComboboxField
                  options={opcionesBienhechor}
                  value={bienhechorSeleccionado}
                  onValueChange={(value) => setValue('bienhechorId', value as number, { shouldValidate: true })}
                  placeholder="¿Quién donó?"
                  emptyText="No hay bienhechores que coincidan"
                />
                {bienhechorId === undefined && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setNuevoBienhechorAbierto(true)}
                    title="Nuevo bienhechor"
                  >
                    <Plus />
                  </Button>
                )}
              </div>
              {errors.bienhechorId && <p className="text-xs text-destructive">{errors.bienhechorId.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="donativo-monto">Monto</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="donativo-monto"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    className="pl-6"
                    {...register('monto')}
                    placeholder="0.00"
                  />
                </div>
                {errors.monto && <p className="text-xs text-destructive">{errors.monto.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Fecha</Label>
                <DatePicker value={fecha} onChange={(value) => setValue('fecha', value ?? '', { shouldValidate: true })} />
                {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Método de pago</Label>
              <Select
                items={ETIQUETA_METODO_PAGO}
                value={metodoPago}
                onValueChange={(value) => setValue('metodoPago', value as MetodoPago, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METODOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {ETIQUETA_METODO_PAGO[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="donativo-folio">Folio de recibo</Label>
              <Input id="donativo-folio" {...register('folioRecibo')} placeholder="Opcional" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="donativo-nota">Nota</Label>
              <Textarea id="donativo-nota" {...register('nota')} placeholder="Opcional" rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Registrar donativo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <NuevoBienhechorDialog
        open={nuevoBienhechorAbierto}
        onOpenChange={setNuevoBienhechorAbierto}
        onCreado={(bienhechor) => setValue('bienhechorId', bienhechor.id, { shouldValidate: true })}
      />
    </>
  );
}
