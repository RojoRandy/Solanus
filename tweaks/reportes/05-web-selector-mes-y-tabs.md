# Paso 5 — Web: selector mes/año y rewire de los 3 tabs

**Estado:** ⬜ pendiente · **Depende de:** paso 1 (api.upload/descargar), paso 3 (contrato nuevo de `/reportes/asistencia`)

> Los pasos 3 y 5 son un par: entre uno y otro la web queda desalineada con el contrato de
> `/reportes/asistencia`. No desplegar en ese estado intermedio.

## Selector de periodo

- **Crear** `apps/web/src/features/reportes/periodo.ts`:
  ```ts
  export interface Periodo { anio: number; mes: number }
  export function periodoActual(): Periodo;
  export function rangoDelMes(p: Periodo): { desde: string; hasta: string }; // YYYY-MM-DD, para endpoints que siguen con desde/hasta
  export function queryPeriodo(p: Periodo): string; // "?anio=2026&mes=9"
  export function etiquetaPeriodo(p: Periodo): string; // "Septiembre 2026"
  export function mesSiguiente(p: Periodo): Periodo;
  export function mesAnterior(p: Periodo): Periodo;
  ```
- **Crear** `components/SelectorMes.tsx`: dos `Select` de shadcn (mes con
  `Intl.DateTimeFormat('es-MX', { month: 'long' })`, año — rango razonable, p. ej. año actual ±3)
  más flechas `ChevronLeft`/`ChevronRight` de `lucide-react` para paso rápido de mes. **No usar**
  `<input type="month">`: Safari lo degrada a caja de texto libre. Las flechas son también el
  mecanismo de "cambiar de mes" que pide la sección de evidencias (paso 6).
- **Borrar** `components/RangoFechaPicker.tsx` (ya no se usa en ningún lado tras este paso).
- **Modificar** `ReportesPage.tsx`: estado `const [periodo, setPeriodo] = useState<Periodo>(periodoActual())`,
  `SelectorMes` en el encabezado en vez de `RangoFechaPicker`, cuarto `TabsTrigger`
  "Evidencias" (contenido placeholder hasta el paso 6) y un botón "Exportar PDF" junto al
  selector (deshabilitado con `title="Disponible en el paso 7"` hasta entonces, o simplemente no
  agregarlo todavía — decisión libre de la sesión que ejecute este paso).

## `ReporteAsistenciaView.tsx` — reescribir

Las 4 cards de KPI (Total/Desayuno/Comida/Cena) se quedan igual, ahora alimentadas por el mismo
DTO. La card "Asistencia por día" (barras hechas con divs) se reemplaza por la matriz.

Estructura de tabla, usando `components/ui/table.tsx` (ya envuelve en
`overflow-x-auto`):

- **Una sola columna sticky**, no dos — meter folio y nombre en la misma celda evita calcular a
  mano el `left` de una segunda columna sticky:
  ```tsx
  <th scope="row" className="sticky left-0 z-10 bg-card w-52 text-left">
    <span className="text-muted-foreground">{fila.folio}</span> {fila.nombre}
  </th>
  ```
  El fondo debe ser **opaco** (`bg-card`, el mismo tono del `Card` contenedor) o las columnas de
  día se ven pasar por debajo al hacer scroll horizontal. Efecto secundario aceptado: el
  `hover:bg-muted/50` de `TableRow` no tiñe esta celda — es el trade-off correcto, no hay que
  resolverlo con JS.
- Columnas de día: `<th scope="col" className="w-7 px-0 text-center text-xs">{dia}</th>` — con el
  `p-2` por defecto de `TableCell`/`TableHead` cada columna mide ~40px y la tabla se va a >1400px
  para 31 días; con `w-7 px-0` son ~28px, tabla ≈ 31×28 + 208 ≈ 1076px (scroll horizontal
  esperado, ya resuelto por el contenedor).
- Celda con asistencia (`dias[i] > 0`):
  ```tsx
  <td
    className="text-center text-xs tabular-nums bg-[#FFBF00] text-[#2A2020]"
    title={`${dia} de ${nombreMes}: ${valor} turno${valor > 1 ? 's' : ''}`}
  >
    {valor}
  </td>
  ```
  **Color de texto oscuro fijo (`text-[#2A2020]`), no `text-foreground`** — en dark mode
  `text-foreground` es casi blanco y falla el contraste sobre ámbar. `#FFBF00` + `#2A2020` da
  ~10:1, cumple WCAG AA de sobra.
  Celda sin asistencia: vacía, sin fondo — se anuncia como "en blanco" a un lector de pantalla,
  que es correcto.
  El número dentro de la celda ya evita que el color sea el único portador de información
  (WCAG 1.4.1) — no hace falta un icono ni un patrón adicional.
- Fila de totales: usar `TableFooter` (ya trae `border-t bg-muted/50 font-medium` en
  `table.tsx`), primera celda sticky con el texto "Total" (mismo `bg-card`/`bg-muted` para no
  romper el sticky), luego `totalesPorDia[i]` por columna, **sin celda final** — el usuario pidió
  explícitamente no agregar un gran total en la esquina.
- Celdas planas, sin componente React por celda: con ~300 comensales × 33 columnas son ~10 000
  nodos `<td>`, manejable si son planos. `// ponytail:` con el techo: pasando ~500 comensales,
  virtualizar filas o paginar por letra inicial de apellido — no antes.

## `ReporteInventarioView.tsx` — reescribir

Las 3 cards de KPI (Entradas/Salidas/Ajustes) y las listas de Mermas/Caducados **se conservan tal
cual** — siguen viniendo de `GET /reportes/inventario`, al que ahora se le manda
`rangoDelMes(periodo)` en vez del rango libre.

Lo que cambia es la tabla "Existencias actuales": se reemplaza por una tabla de movimientos del
mes, reusando lo que ya existe en vez de duplicar:

- `useMovimientos({ ...rangoDelMes(periodo), page, limit })` de
  [features/inventario/api.ts](../../apps/web/src/features/inventario/api.ts) +
  `usePaginacion()` de `lib/pagination.ts`.
- Columnas: las mismas que
  [MovimientosPage.tsx](../../apps/web/src/features/inventario/MovimientosPage.tsx) (Fecha,
  Producto, Unidad, Tipo, Motivo, Cantidad, Registró, Notas) — esa tabla es el molde, copiar su
  `<TableRow>` de datos.
- `PaginationControls` de `components/ui/pagination.tsx` debajo.

En la API: quitar `existencias` de `ReporteInventarioResponseDto` y del usecase
(`reporte-inventario.usecase.ts`) — deja de hacer el `findMany` de `varianteInventario` con sus
`lotes`, que ya no se usa en ningún consumidor.

## `ReporteDonativosView.tsx` — reescribir

La tabla principal pasa a ser la de **donativos en dinero** del mes. Reusar
`HistorialDonativos` de
[features/donativos/components/HistorialDonativos.tsx](../../apps/web/src/features/donativos/components/HistorialDonativos.tsx)
generalizándolo — hoy probablemente asume `bienhechorId` fijo (vista desde la ficha del
bienhechor). Ampliar sus props a:
```ts
interface Props {
  bienhechorId?: number;
  desde?: string;
  hasta?: string;
  mostrarBienhechor?: boolean; // agrega la columna Bienhechor cuando no hay bienhechorId fijo
}
```
Diff esperado ~15 líneas. Ya trae gratis `totalMonto` (de `ListaDonativosDineroResponseDto`) y el
borrado (`useEliminarDonativoDinero`).

Las 2 cards de especie (`totalLotes`, `valorEstimado`) que ya existen se quedan arriba, sin
cambios, como resumen de lo donado en especie ese mes.

## `features/reportes/api.ts` y `types.ts`

- `useReporteAsistencia(periodo: Periodo)` → `?anio=&mes=` (contrato nuevo del paso 3).
- `useReporteInventario`/`useReporteDonativos` siguen recibiendo `desde`/`hasta` derivados con
  `rangoDelMes(periodo)` — no cambian de contrato en la API, solo cambia qué les manda la página.
- `types.ts`: reemplazar `AsistenciaPorDia`/el shape viejo por `FilaAsistencia`/
  `ReporteAsistencia` espejo del DTO nuevo.

## Terminado cuando

- `pnpm --filter web lint && pnpm --filter web typecheck` limpios.
- En navegador (`preview_start`, puerto 5183): la matriz muestra celdas ámbar con número de
  turnos, la fila de totales suma correctamente, el tab Inventario muestra movimientos paginados
  del mes, el tab Donativos muestra la tabla de donativos en dinero con su total, y las flechas
  del selector cambian de mes correctamente.
