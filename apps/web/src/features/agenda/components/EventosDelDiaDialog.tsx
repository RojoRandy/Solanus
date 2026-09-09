import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { estiloEvento } from '../estilo-evento';
import type { EventoAgenda } from '../types';

interface EventosDelDiaDialogProps {
  fecha: Date | null;
  eventos: EventoAgenda[];
  onOpenChange: (open: boolean) => void;
}

export function EventosDelDiaDialog({ fecha, eventos, onOpenChange }: EventosDelDiaDialogProps) {
  return (
    <Dialog open={fecha !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fecha ? format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es }) : ''}</DialogTitle>
        </DialogHeader>
        {eventos.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Sin eventos programados" className="py-8" />
        ) : (
          <ul className="flex flex-col gap-2">
            {eventos.map((evento) => (
              <li key={evento.id} className="flex items-start gap-3 rounded-md border px-3 py-2" style={estiloEvento(evento.color)}>
                <span className="shrink-0 text-sm font-medium">{format(new Date(evento.fechaHora), 'h:mm a')}</span>
                <span className="text-sm">{evento.descripcion}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
