import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBienhechores } from '@/features/bienhechores/api';
import { ComboboxField } from './ComboboxField';
import {
  useCategorias,
  useInventarioItems,
  useRegistrarEntrada,
  useUbicaciones,
  useUnidades,
} from './api';
import type { CrearInventarioItemInput, OrigenLote } from './types';

const hoyISO = () => new Date().toISOString().slice(0, 10);

export function RegistrarEntradaPage() {
  const navigate = useNavigate();

  const { data: items } = useInventarioItems();
  const { data: categorias } = useCategorias();
  const { data: unidades } = useUnidades();
  const { data: ubicaciones } = useUbicaciones();
  const { data: bienhechores } = useBienhechores();
  const registrarEntrada = useRegistrarEntrada();

  const [origenProducto, setOrigenProducto] = useState<'existente' | 'nuevo'>('existente');
  const [itemId, setItemId] = useState<number | undefined>(undefined);
  const [itemNuevo, setItemNuevo] = useState<Partial<CrearInventarioItemInput>>({});

  const [cantidadInicial, setCantidadInicial] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(hoyISO());
  const [costoUnitario, setCostoUnitario] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [origen, setOrigen] = useState<OrigenLote>('COMPRADO');
  const [bienhechorId, setBienhechorId] = useState<number | undefined>(undefined);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [cfdi, setCfdi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const opcionesProductos = useMemo(
    () => (items ?? []).map((item) => ({ value: item.id, label: item.nombre })),
    [items],
  );
  const opcionesBienhechores = useMemo(
    () => (bienhechores ?? []).map((b) => ({ value: b.id, label: b.nombre })),
    [bienhechores],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const cantidad = Number(cantidadInicial);
    if (!cantidad || cantidad <= 0) {
      toast.error('Indica una cantidad mayor a cero');
      return;
    }
    if (origenProducto === 'existente' && !itemId) {
      toast.error('Selecciona un producto existente o cambia a "Producto nuevo"');
      return;
    }
    if (origenProducto === 'nuevo' && (!itemNuevo.nombre || !itemNuevo.categoriaId || !itemNuevo.unidadId)) {
      toast.error('Completa nombre, categoría y unidad del producto nuevo');
      return;
    }
    if (origen === 'DONADO' && !bienhechorId) {
      toast.error('Selecciona el bienhechor que hizo la donación');
      return;
    }

    setEnviando(true);
    try {
      await registrarEntrada.mutateAsync({
        itemId: origenProducto === 'existente' ? itemId : undefined,
        itemNuevo: origenProducto === 'nuevo' ? (itemNuevo as CrearInventarioItemInput) : undefined,
        cantidadInicial: cantidad,
        fechaCaducidad: fechaCaducidad || undefined,
        fechaIngreso: fechaIngreso || undefined,
        costoUnitario: costoUnitario ? Number(costoUnitario) : undefined,
        costoTotal: costoTotal ? Number(costoTotal) : undefined,
        origen,
        bienhechorId: origen === 'DONADO' ? bienhechorId : undefined,
        numeroFactura: numeroFactura || undefined,
        cfdi: cfdi || undefined,
      });
      toast.success('Entrada registrada correctamente');
      navigate('/inventario');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo registrar la entrada');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Registrar entrada</h1>
          <p className="text-sm text-muted-foreground">Da de alta un nuevo lote de inventario (compra o donación)</p>
        </div>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Producto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={origenProducto} onValueChange={(value) => setOrigenProducto(value as 'existente' | 'nuevo')}>
              <TabsList>
                <TabsTrigger value="existente">Producto existente</TabsTrigger>
                <TabsTrigger value="nuevo">Producto nuevo</TabsTrigger>
              </TabsList>
            </Tabs>

            {origenProducto === 'existente' ? (
              <div className="flex flex-col gap-1.5">
                <Label>Producto</Label>
                <ComboboxField
                  options={opcionesProductos}
                  value={itemId}
                  onValueChange={setItemId}
                  placeholder="Buscar producto por nombre…"
                  emptyText="No hay productos que coincidan"
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="nombreNuevo">Nombre del producto</Label>
                  <Input
                    id="nombreNuevo"
                    value={itemNuevo.nombre ?? ''}
                    onChange={(event) => setItemNuevo((prev) => ({ ...prev, nombre: event.target.value }))}
                    placeholder="Frijol bayo"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="marcaNueva">Marca</Label>
                  <Input
                    id="marcaNueva"
                    value={itemNuevo.marca ?? ''}
                    onChange={(event) => setItemNuevo((prev) => ({ ...prev, marca: event.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="presentacionNueva">Presentación</Label>
                  <Input
                    id="presentacionNueva"
                    value={itemNuevo.presentacion ?? ''}
                    onChange={(event) => setItemNuevo((prev) => ({ ...prev, presentacion: event.target.value }))}
                    placeholder="Bolsa de 1kg"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={itemNuevo.categoriaId ? String(itemNuevo.categoriaId) : undefined}
                    onValueChange={(value) =>
                      setItemNuevo((prev) => ({ ...prev, categoriaId: Number(value) }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias?.map((categoria) => (
                        <SelectItem key={categoria.id} value={String(categoria.id)}>
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unidad de medida</Label>
                  <Select
                    value={itemNuevo.unidadId ? String(itemNuevo.unidadId) : undefined}
                    onValueChange={(value) => setItemNuevo((prev) => ({ ...prev, unidadId: Number(value) }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades?.map((unidad) => (
                        <SelectItem key={unidad.id} value={String(unidad.id)}>
                          {unidad.nombre} ({unidad.abrevia})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Ubicación</Label>
                  <Select
                    value={itemNuevo.ubicacionId ? String(itemNuevo.ubicacionId) : undefined}
                    onValueChange={(value) => setItemNuevo((prev) => ({ ...prev, ubicacionId: Number(value) }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {ubicaciones?.map((ubicacion) => (
                        <SelectItem key={ubicacion.id} value={String(ubicacion.id)}>
                          {ubicacion.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del lote</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cantidadInicial">Cantidad</Label>
                <Input
                  id="cantidadInicial"
                  type="number"
                  step="any"
                  min={0}
                  value={cantidadInicial}
                  onChange={(event) => setCantidadInicial(event.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Origen</Label>
                <Select value={origen} onValueChange={(value) => setOrigen(value as OrigenLote)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPRADO">Comprado</SelectItem>
                    <SelectItem value="DONADO">Donado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {origen === 'DONADO' && (
              <div className="flex flex-col gap-1.5">
                <Label>Bienhechor</Label>
                <ComboboxField
                  options={opcionesBienhechores}
                  value={bienhechorId}
                  onValueChange={setBienhechorId}
                  placeholder="Buscar bienhechor por nombre…"
                  emptyText="No hay bienhechores que coincidan"
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
                <Input
                  id="fechaIngreso"
                  type="date"
                  value={fechaIngreso}
                  onChange={(event) => setFechaIngreso(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fechaCaducidad">Fecha de caducidad</Label>
                <Input
                  id="fechaCaducidad"
                  type="date"
                  value={fechaCaducidad}
                  onChange={(event) => setFechaCaducidad(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="costoUnitario">Costo unitario</Label>
                <Input
                  id="costoUnitario"
                  type="number"
                  step="any"
                  min={0}
                  value={costoUnitario}
                  onChange={(event) => setCostoUnitario(event.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="costoTotal">Costo total</Label>
                <Input
                  id="costoTotal"
                  type="number"
                  step="any"
                  min={0}
                  value={costoTotal}
                  onChange={(event) => setCostoTotal(event.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            {origen === 'COMPRADO' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="numeroFactura">Número de factura</Label>
                  <Input
                    id="numeroFactura"
                    value={numeroFactura}
                    onChange={(event) => setNumeroFactura(event.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cfdi">CFDI</Label>
                  <Input id="cfdi" value={cfdi} onChange={(event) => setCfdi(event.target.value)} placeholder="Opcional" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => void navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={enviando}>
            Registrar entrada
          </Button>
        </div>
      </form>
    </div>
  );
}
