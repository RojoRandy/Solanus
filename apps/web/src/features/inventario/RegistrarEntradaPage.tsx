import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field } from '@base-ui/react/field';
import { toast } from 'sonner';
import { ArrowLeft, Info, Plus, Trash2 } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { hoyISO } from '@/lib/fecha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DatePicker } from '@/components/ui/date-picker';
import { useBienhechores } from '@/features/bienhechores/api';
import type { Bienhechor } from '@/features/bienhechores/types';
import { NuevoBienhechorDialog } from '@/features/bienhechores/components/NuevoBienhechorDialog';
import { ComboboxField } from './ComboboxField';
import { NuevoProductoDialog } from './components/NuevoProductoDialog';
import { useProducto, useProductos, useRegistrarEntrada } from './api';
import { etiquetaMarcaLote, etiquetaProducto } from './format';
import { ETIQUETA_ESTADO, type LineaEntradaInput, type OrigenLote, type Producto } from './types';

interface LineaForm {
  key: number;
  productoId?: number;
  cantidad: string;
  costoUnitario: string;
  fechaCaducidad?: string;
  noCaduca: boolean;
}

let contadorLinea = 0;
function nuevaLinea(): LineaForm {
  contadorLinea += 1;
  return { key: contadorLinea, cantidad: '', costoUnitario: '', noCaduca: false };
}

function InformacionProducto({ productoId }: { productoId: number }) {
  const { data: producto } = useProducto(productoId);
  if (!producto) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {producto.unidad.nombre} ({producto.unidad.abrevia}) · {ETIQUETA_ESTADO[producto.estado]} · {etiquetaMarcaLote(producto)}
    </p>
  );
}

function cantidadInvalida(linea: LineaForm) {
  return !Number.isFinite(Number(linea.cantidad)) || Number(linea.cantidad) <= 0;
}

function costoInvalido(linea: LineaForm, origen: OrigenLote) {
  const costo = Number(linea.costoUnitario);
  return !Number.isFinite(costo) || (origen === 'COMPRADO' ? costo <= 0 : costo < 0);
}

function costoTotal(linea: LineaForm) {
  const total = Number(linea.cantidad) * Number(linea.costoUnitario);
  return Number.isFinite(total) ? total : 0;
}

export function RegistrarEntradaPage() {
  const navigate = useNavigate();
  // ponytail: limit fijo, pasar a búsqueda remota si el catálogo crece más de 500
  const { data: productosPag } = useProductos({ limit: 500 });
  const { data: bienhechores } = useBienhechores();
  const registrarEntrada = useRegistrarEntrada();

  const [fechaIngreso, setFechaIngreso] = useState<string | undefined>(hoyISO);
  const [origen, setOrigen] = useState<OrigenLote>('COMPRADO');
  const [bienhechorId, setBienhechorId] = useState<number>();
  const [cfdi, setCfdi] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [lineas, setLineas] = useState<LineaForm[]>(() => [nuevaLinea()]);
  const [validacionIntentada, setValidacionIntentada] = useState(false);
  const [nuevoProductoLinea, setNuevoProductoLinea] = useState<number | null>(null);
  const [productosCreados, setProductosCreados] = useState<Producto[]>([]);
  const [nuevoBienhechorAbierto, setNuevoBienhechorAbierto] = useState(false);
  const [bienhechorCreado, setBienhechorCreado] = useState<Bienhechor>();

  const opcionesProductos = useMemo(() => {
    const productos = new Map((productosPag?.items ?? []).map((producto) => [producto.id, producto]));
    productosCreados.forEach((producto) => productos.set(producto.id, producto));
    return Array.from(productos.values(), (producto) => ({ value: producto.id, label: etiquetaProducto(producto) }));
  }, [productosPag, productosCreados]);
  const opcionesBienhechores = useMemo(() => {
    const opciones = (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre }));
    if (bienhechorCreado && !opciones.some((b) => b.value === bienhechorCreado.id)) {
      opciones.push({ value: bienhechorCreado.id, label: bienhechorCreado.nombre });
    }
    return opciones;
  }, [bienhechores, bienhechorCreado]);

  function actualizarLinea(key: number, cambios: Partial<LineaForm>) {
    setLineas((prev) => prev.map((linea) => linea.key === key ? { ...linea, ...cambios } : linea));
  }

  function quitarLinea(key: number) {
    setLineas((prev) => prev.length > 1 ? prev.filter((linea) => linea.key !== key) : prev);
  }

  async function onSubmit() {
    if (registrarEntrada.isPending) return;
    setValidacionIntentada(true);
    if (origen === 'DONADO' && !bienhechorId) {
      toast.error('Selecciona el bienhechor que hizo la donación.');
      return;
    }
    const lineasValidas: LineaEntradaInput[] = [];
    for (const [index, linea] of lineas.entries()) {
      if (!linea.productoId) {
        toast.error(`Selecciona el producto de la línea ${index + 1}.`);
        return;
      }
      if (cantidadInvalida(linea)) {
        toast.error(`Indica una cantidad mayor a cero en el producto ${index + 1}.`);
        return;
      }
      if (costoInvalido(linea, origen)) {
        toast.error(origen === 'COMPRADO'
          ? `Indica un costo unitario mayor a cero en el producto ${index + 1}.`
          : `Indica un costo unitario válido, igual o mayor a cero, en el producto ${index + 1}.`);
        return;
      }
      if (!linea.noCaduca && !linea.fechaCaducidad) {
        toast.error(`Indica la fecha de caducidad o marca "No caduca" en el producto ${index + 1}.`);
        return;
      }
      lineasValidas.push({
        productoId: linea.productoId,
        cantidad: Number(linea.cantidad),
        costoUnitario: linea.costoUnitario ? Number(linea.costoUnitario) : undefined,
        fechaCaducidad: linea.noCaduca ? undefined : linea.fechaCaducidad,
        noCaduca: linea.noCaduca,
      });
    }

    try {
      const { entradaId, lotes } = await registrarEntrada.mutateAsync({
        fechaIngreso,
        origen,
        bienhechorId: origen === 'DONADO' ? bienhechorId : undefined,
        cfdi: cfdi || undefined,
        ubicacion: ubicacion || undefined,
        lineas: lineasValidas,
      });
      toast.success(`Lote #${entradaId} registrado con ${lotes.length} producto(s)`);
      void navigate('/inventario');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar la entrada');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Volver" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Registrar entrada</h1>
          <p className="text-sm text-muted-foreground">Registra varios productos de una misma compra o donación</p>
        </div>
      </div>

      <form noValidate onSubmit={(event) => { event.preventDefault(); void onSubmit(); }} className="flex w-full max-w-7xl flex-col gap-4">
        <Card className="animate-in fade-in slide-in-from-bottom-1">
          <CardHeader><CardTitle>Datos de la entrada</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
              <DatePicker id="fechaIngreso" value={fechaIngreso} onChange={setFechaIngreso} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="origen">Origen</Label>
              <Select items={{ COMPRADO: 'Comprado', DONADO: 'Donado' }} value={origen}
                onValueChange={(value) => { if (value === 'COMPRADO' || value === 'DONADO') setOrigen(value); }}>
                <SelectTrigger id="origen" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRADO">Comprado</SelectItem>
                  <SelectItem value="DONADO">Donado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {origen === 'DONADO' && (
              <Field.Root className="flex min-w-0 flex-col gap-1.5" invalid={validacionIntentada && !bienhechorId}>
                <Field.Label className="text-sm font-medium">Bienhechor</Field.Label>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <ComboboxField options={opcionesBienhechores} value={bienhechorId} onValueChange={setBienhechorId}
                      placeholder="Buscar bienhechor por nombre…" emptyText="No hay bienhechores que coincidan" />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => setNuevoBienhechorAbierto(true)} aria-label="Nuevo bienhechor"><Plus /></Button>
                </div>
              </Field.Root>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cfdi" className="gap-1">
                CFDI (número de factura)
                <Tooltip>
                  <TooltipTrigger render={<Info className="size-3.5 text-muted-foreground" />} />
                  <TooltipContent>Puedes asignarlo después desde Movimientos</TooltipContent>
                </Tooltip>
              </Label>
              <Input id="cfdi" value={cfdi} onChange={(event) => setCfdi(event.target.value)} placeholder="Opcional" aria-describedby="cfdi-ayuda" />
              <p id="cfdi-ayuda" className="text-xs text-muted-foreground">Puedes asignarlo después desde Movimientos</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input id="ubicacion" value={ubicacion} onChange={(event) => setUbicacion(event.target.value)} placeholder="Opcional — Almacén, Cocina…" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-1">
          <CardHeader><CardTitle>Productos</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {lineas.map((linea, index) => (
              <div key={linea.key} className="grid items-start gap-3 rounded-lg border p-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_minmax(0,1.8fr)_auto]">
                <Field.Root className="flex min-w-0 flex-col gap-1.5" invalid={validacionIntentada && !linea.productoId}>
                  <Field.Label className="flex h-5 items-center text-sm leading-none font-medium">Producto {index + 1}</Field.Label>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <ComboboxField options={opcionesProductos} value={linea.productoId}
                        onValueChange={(value) => actualizarLinea(linea.key, { productoId: value })}
                        placeholder="Buscar producto…" emptyText="No hay productos que coincidan" />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={() => setNuevoProductoLinea(linea.key)} aria-label={`Nuevo producto para la línea ${index + 1}`}><Plus /></Button>
                  </div>
                  {linea.productoId !== undefined && <InformacionProducto productoId={linea.productoId} />}
                </Field.Root>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor={`cantidad-${linea.key}`} className="h-5">Cantidad<span className="sr-only"> del producto {index + 1}</span></Label>
                  <Input id={`cantidad-${linea.key}`} type="number" step="any" min={0} placeholder="0" value={linea.cantidad}
                    aria-invalid={validacionIntentada && cantidadInvalida(linea)}
                    onChange={(event) => actualizarLinea(linea.key, { cantidad: event.target.value })} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor={`costo-${linea.key}`} className="h-5">Costo unitario<span className="sr-only"> del producto {index + 1}</span></Label>
                  <Input id={`costo-${linea.key}`} type="number" step="any" min={0} placeholder={origen === 'DONADO' ? 'Opcional' : '0.00'} value={linea.costoUnitario}
                    aria-invalid={validacionIntentada && costoInvalido(linea, origen)}
                    onChange={(event) => actualizarLinea(linea.key, { costoUnitario: event.target.value })} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor={`total-${linea.key}`} className="h-5">Costo total<span className="sr-only"> del producto {index + 1}</span></Label>
                  <Input id={`total-${linea.key}`} readOnly value={costoTotal(linea).toFixed(2)} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex h-5 items-center justify-between gap-2">
                    <Label htmlFor={`caducidad-${linea.key}`}>Caducidad<span className="sr-only"> del producto {index + 1}</span></Label>
                    <Label htmlFor={`no-caduca-${linea.key}`} className="shrink-0 text-xs text-muted-foreground">
                      <Checkbox id={`no-caduca-${linea.key}`} checked={linea.noCaduca}
                        onCheckedChange={(checked) => actualizarLinea(linea.key, { noCaduca: Boolean(checked) })} />
                      No caduca<span className="sr-only"> el producto {index + 1}</span>
                    </Label>
                  </div>
                  <DatePicker id={`caducidad-${linea.key}`} value={linea.fechaCaducidad} disabled={linea.noCaduca}
                    onChange={(value) => actualizarLinea(linea.key, { fechaCaducidad: value })} />
                </div>
                {lineas.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <div aria-hidden="true" className="h-5" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => quitarLinea(linea.key)} aria-label={`Quitar producto ${index + 1}`}><Trash2 /></Button>
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" className="self-start" onClick={() => setLineas((prev) => [...prev, nuevaLinea()])}>
              <Plus />Agregar producto
            </Button>
            <p className="text-right font-semibold">
              Total de la entrada: {lineas.reduce((total, linea) => total + costoTotal(linea), 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </p>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => void navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={registrarEntrada.isPending}>{registrarEntrada.isPending ? 'Guardando…' : 'Registrar entrada'}</Button>
        </div>
      </form>

      <NuevoProductoDialog open={nuevoProductoLinea !== null} onOpenChange={(open) => { if (!open) setNuevoProductoLinea(null); }}
        onCreado={(producto) => {
          setProductosCreados((prev) => [...prev, producto]);
          if (nuevoProductoLinea !== null) actualizarLinea(nuevoProductoLinea, { productoId: producto.id });
        }} />
      <NuevoBienhechorDialog open={nuevoBienhechorAbierto} onOpenChange={setNuevoBienhechorAbierto}
        onCreado={(bienhechor) => { setBienhechorCreado(bienhechor); setBienhechorId(bienhechor.id); }} />
    </div>
  );
}
