import * as React from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComboboxField } from '../ComboboxField';
import { ApiError } from '@/lib/api-client';
import { useLotesVariante, useMotivos, useRegistrarAjuste, useVariantes } from '../api';
import { ETIQUETA_ESTADO } from '../types';

interface RegistrarAjusteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Único camino para corregir una existencia sin tocar el histórico de movimientos. */
export function RegistrarAjusteDialog({ open, onOpenChange }: RegistrarAjusteDialogProps) {
  const [varianteId, setVarianteId] = React.useState<number>();
  const [signo, setSigno] = React.useState<'aumentar' | 'disminuir'>('disminuir');
  const [cantidad, setCantidad] = React.useState('');
  const [loteId, setLoteId] = React.useState<number>();
  const [motivoId, setMotivoId] = React.useState<number>();
  const [notas, setNotas] = React.useState('');

  const { data: variantesPag } = useVariantes({ limit: 200, incluirInactivas: true });
  const { data: lotes } = useLotesVariante(signo === 'aumentar' ? varianteId : undefined);
  const { data: motivos } = useMotivos();
  const registrarAjuste = useRegistrarAjuste();

  const opcionesVariantes = (variantesPag?.items ?? []).map((v) => ({
    value: v.id,
    label: `${v.producto.nombre} · ${v.unidad.abrevia} · ${ETIQUETA_ESTADO[v.estado].toLowerCase()} (existencia: ${v.stockActual})`,
  }));
  const opcionesLotes = (lotes ?? []).map((l) => ({
    value: l.id,
    label: `${l.marca ?? 'Sin marca'} · disponible ${l.cantidadDisponible}`,
  }));

  function limpiar() {
    setVarianteId(undefined);
    setSigno('disminuir');
    setCantidad('');
    setLoteId(undefined);
    setMotivoId(undefined);
    setNotas('');
  }

  function registrar() {
    const cantidadNum = Number(cantidad);
    if (!varianteId || !cantidadNum || cantidadNum <= 0 || !motivoId || !notas.trim()) {
      toast.error('Completa variante, cantidad, motivo y una nota explicando el ajuste.');
      return;
    }
    if (signo === 'aumentar' && !loteId) {
      toast.error('Selecciona a qué lote se agrega la cantidad.');
      return;
    }
    registrarAjuste.mutate(
      {
        varianteId,
        cantidad: signo === 'aumentar' ? cantidadNum : -cantidadNum,
        motivoId,
        loteId,
        notas: notas.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Ajuste registrado');
          limpiar();
          onOpenChange(false);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar el ajuste'),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar ajuste de inventario</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Variante</Label>
            <ComboboxField options={opcionesVariantes} value={varianteId} onValueChange={setVarianteId} placeholder="Buscar producto…" />
          </div>

          <Tabs value={signo} onValueChange={(value) => setSigno(value as 'aumentar' | 'disminuir')}>
            <TabsList>
              <TabsTrigger value="disminuir">Disminuir existencia</TabsTrigger>
              <TabsTrigger value="aumentar">Aumentar existencia</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ajuste-cantidad">Cantidad</Label>
              <Input id="ajuste-cantidad" type="number" min={0} step="any" value={cantidad} onChange={(event) => setCantidad(event.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Motivo</Label>
              <Select
                items={Object.fromEntries((motivos ?? []).map((m) => [String(m.id), m.nombre]))}
                value={motivoId ? String(motivoId) : undefined}
                onValueChange={(value) => setMotivoId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {motivos?.map((motivo) => (
                    <SelectItem key={motivo.id} value={String(motivo.id)}>
                      {motivo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {signo === 'aumentar' && (
            <div className="flex flex-col gap-2">
              <Label>Lote al que se agrega</Label>
              <ComboboxField options={opcionesLotes} value={loteId} onValueChange={setLoteId} placeholder="Selecciona un lote…" emptyText="Sin lotes disponibles" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="ajuste-notas">Notas</Label>
            <Textarea id="ajuste-notas" value={notas} onChange={(event) => setNotas(event.target.value)} rows={2} placeholder="Explica el motivo del ajuste" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={registrar} disabled={registrarAjuste.isPending}>
            {registrarAjuste.isPending ? 'Guardando…' : 'Registrar ajuste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
