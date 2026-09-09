# Paso 7 — Comensales: exportar a Excel y PDF

**Estado:** ✅ hecho · **Depende de:** paso 6 (usa `construirWhereComensales`)

> Hecho: `exceljs` agregado a `apps/api`. `exportar-comensales-xlsx.usecase.ts` (fila congelada,
> autofiltro, fechas como Date, encabezado vino) y `exportar-comensales-pdf.usecase.ts` (tabla
> vertical con `thead` repetido, contenido escapado, bloque de filtros). Endpoints
> `GET /comensales/exportar.xlsx` y `.pdf` **antes** de `@Get(':id')`, con `ROLES_ESCRITURA` y
> `StreamableFile`. Tope `LIMITE_EXPORTACION` (5000) → `EXPORTACION_DEMASIADO_GRANDE`.
> En la web: `descargarComensales(formato, params)` en `api.ts` (fetch crudo) y dos botones
> "Excel"/"PDF" en `ComensalesListView` gated por `puedeGestionar` (antes `puedeCrear`).
> Verificado a nivel use-case: xlsx = zip válido (504b), pdf = `%PDF-` (55 KB, puppeteer).
> typecheck+lint web ok, 34 tests api verdes, build api ok.

## Alcance

Dos botones en el listado de comensales que descargan el padrón **respetando los filtros
activos** (búsqueda, activo/inactivo, grupo etario). Formatos: `.xlsx` real y PDF.

Única exportación que existe hoy en el repo: el PDF de expediente de comensal
([generar-pdf-expediente.usecase.ts](../apps/api/src/modules/comensales/usecases/generar-pdf-expediente.usecase.ts)).
Se replica su patrón: use-case → `{ buffer, filename }` → controller con `@Header` +
`StreamableFile` → `fetch` crudo en `api.ts` → blob → `<a download>`.

## Dependencia nueva

```bash
pnpm --filter api add exceljs
```

Es la única del plan. `apps/api/tsconfig.json` tiene `esModuleInterop: true` →
`import ExcelJS from 'exceljs'` funciona.

## API

### Endpoints — dos, no uno con `?formato=`

`@Header()` de Nest es estático por handler; ramificar el Content-Type obligaría a `@Res()`, lo
que saca la respuesta del flujo de `StreamableFile` y de su exención en
`response.interceptor.ts:27` — la regresión que `apps/api/CLAUDE.md` advierte no reintroducir
(`c1323ba`).

En [comensales.controller.ts](../apps/api/src/modules/comensales/comensales.controller.ts),
**antes de `@Get(':id')`** (L93), justo después de `findAll()` (L86-91). Si van después, Nest
hace match con `:id`, `IdParamDto` recibe `"exportar.xlsx"` y responde 400.

```ts
@Get('exportar.xlsx')
@Auth(...ROLES_ESCRITURA)
@Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
async exportarXlsx(@Query() query: ListarComensalesQueryDto) {
  const { buffer, filename } = await this.exportarComensalesXlsx.execute(query);
  return new StreamableFile(buffer, { disposition: `attachment; filename="${filename}"` });
}

@Get('exportar.pdf')
@Auth(...ROLES_ESCRITURA)
@Header('Content-Type', 'application/pdf')
async exportarPdf(@Query() query: ListarComensalesQueryDto) {
  const { buffer, filename } = await this.exportarComensalesPdf.execute(query);
  return new StreamableFile(buffer, { disposition: `attachment; filename="${filename}"` });
}
```

`ROLES_ESCRITURA` (ADMIN + USUARIO), no `ROLES_LECTURA`: un archivo con el padrón completo, CURP
y tutores es otro nivel de riesgo que paginar en pantalla. Reutilizan `ListarComensalesQueryDto`
tal cual (ignoran `page`/`limit`). Nombres: `comensales-YYYY-MM-DD.xlsx` / `.pdf`
(`now().format('YYYY-MM-DD')`).

### Tope de seguridad

Padrón real: ~379 (`docs/Lista Comensales.csv`, 380 líneas). `LIMITE_EXPORTACION = 5000` (ya
definido en `comensal-where.util.ts`, paso 6). No truncar en silencio:

```ts
const filas = await this.prisma.comensal.findMany({
  where: construirWhereComensales(query),
  orderBy: construirOrderByComensales(query),
  select: comensalListSelect,
  take: LIMITE_EXPORTACION + 1,
});
if (filas.length > LIMITE_EXPORTACION)
  throw ComensalErrors.Exceptions.EXPORTACION_DEMASIADO_GRANDE({ limite: LIMITE_EXPORTACION });
```

`EXPORTACION_DEMASIADO_GRANDE` → `BadRequestException` /
`'La exportación supera el límite de registros; filtra la lista antes de exportar'` en
[comensal.errors.ts](../apps/api/src/common/errors/comensal.errors.ts).

### `exportar-comensales-xlsx.usecase.ts`

```ts
export interface ArchivoExportado { buffer: Buffer; filename: string; }

const COLOR_VINO_ARGB = 'FF6B3140';
```

`implements UseCase<ListarComensalesQueryDto, ArchivoExportado>`, inyecta `PrismaService`. Trae
las filas (con el tope), las mapea con `mapComensalResponse` (da `edad` gratis), y:

- `workbook.addWorksheet('Comensales')` con `hoja.columns`: Folio (10), Nombres (24),
  Apellidos (26), Fecha de nacimiento (20, `numFmt: 'dd/mm/yyyy'`), Edad (8), CURP (22),
  Tutor (30), Estado (12), Fecha de alta (16, `numFmt: 'dd/mm/yyyy'`).
- Fila 1: `font: { bold, color: FFFFFFFF }`, `fill: solid COLOR_VINO_ARGB`.
- `hoja.views = [{ state: 'frozen', ySplit: 1 }]`, `hoja.autoFilter = { from: 'A1', to: 'I1' }`.
- `addRow` por comensal. **Pasar `Date` reales** en las columnas de fecha (no strings) para que
  Excel filtre/ordene por fecha. Tutor: `` `${t.nombres} ${t.apellidos} (folio ${t.folio})` ``
  o `''`. Estado: `'Activo'` / `'Inactivo'`.
- `const buf = await workbook.xlsx.writeBuffer(); return { buffer: Buffer.from(buf as ArrayBuffer), filename };`
  (`writeBuffer` devuelve un ArrayBuffer-like, hay que envolverlo).

Fuera: `id`, `fotoPath`, `ineFrontPath`, `ineBackPath` (rutas internas, no sirven en una hoja).

### `exportar-comensales-pdf.usecase.ts`

`implements UseCase<ListarComensalesQueryDto, ArchivoExportado>` (importa `ArchivoExportado` del
usecase de xlsx). Inyecta `PdfService` (su módulo es `@Global()`, no hay que importar nada).

- HTML como template literal con `<style>` inline, reutilizando `.marca` / `.encabezado` /
  `h2.titulo` de `generar-pdf-expediente.usecase.ts:201-279`. `COLOR_VINO = '#6B3140'`.
- Vertical, sin tocar `PdfService` (solo expone `margin`): con 12 mm caben 7 columnas — Folio,
  Nombre completo, Edad, F. nacimiento, CURP, Tutor, Estado.
- Encabezados repetidos por página **gratis**: `<table><thead>…</thead><tbody>…</tbody></table>`
  con `thead { display: table-header-group; }` (Chromium lo hace solo) + `tr { break-inside: avoid; }`.
- Bloque inicial: título, filtros aplicados en palabras, total de registros, fecha de generación:

```ts
const filtrosTexto = [
  query.activo === 'false' ? 'Inactivos' : 'Activos',
  query.grupoEdad === 'ninos' ? 'Niños (menores de 18)' : null,
  query.grupoEdad === 'adultos_mayores' ? 'Adultos mayores (60 o más)' : null,
  query.busqueda?.trim() ? `Búsqueda: «${query.busqueda.trim()}»` : null,
].filter(Boolean).join(' · ');
```

- **Escapar** el contenido: los nombres son captura libre y aquí se interpolan ~2 700 celdas
  (a diferencia del expediente, que interpola pocos campos). `escapar(t) => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')`.
- CSS de la tabla: `font-size: 9px`, `th { background:#6B3140; color:#fff }`,
  `tbody tr:nth-child(even) { background:#FAF7F7 }`.

Sin números de página ni landscape (requieren extender `PdfService`). Agregar si se ve apretado.

Registrar ambos use-cases en `comensales.module.ts`.

## Web

### `comensales/api.ts` — `descargarComensales`

Calcado de `descargarExpedientePdf` (L181-211): `fetch` crudo con `Authorization` manual (el
`api-client` fuerza `Content-Type: application/json` y hace `.json()`).

```ts
export async function descargarComensales(
  formato: 'xlsx' | 'pdf',
  params: ListarComensalesParams,
): Promise<void> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const { page: _p, limit: _l, ...filtros } = params;   // el export no pagina
  const response = await fetch(
    `${API_BASE_URL}/comensales/exportar.${formato}${construirQueryString(filtros)}`,
    { headers },
  );
  if (!response.ok) {
    let description = 'No se pudo exportar el listado';
    try { description = ((await response.json()) as { description?: string }).description ?? description; }
    catch { /* no era JSON */ }
    throw new ApiError(response.status, 'ERROR_EXPORTANDO_COMENSALES', description);
  }
  const url = window.URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `comensales-${new Date().toISOString().slice(0, 10)}.${formato}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
```

### `ComensalesListView.tsx`

**Dos botones, no dropdown**: `components/ui/dropdown-menu.tsx` existe pero no tiene un solo
consumidor en la app; dos `<Button variant="outline" size="sm">` con `FileSpreadsheet` y
`FileText` (lucide) cuestan menos.

```tsx
const [exportando, setExportando] = React.useState<'xlsx' | 'pdf' | null>(null);

async function exportar(formato: 'xlsx' | 'pdf') {
  setExportando(formato);
  try {
    await descargarComensales(formato, { busqueda: busqueda || undefined, activo, grupoEdad, ordenarPor, orden });
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'No se pudo exportar el listado.');
  } finally {
    setExportando(null);
  }
}
```

- Van en el grupo derecho de la barra de filtros. Spinner con `exportando === formato`.
- Visibilidad: el flag que ya existe en L33 (`puedeCrear`, `user?.rol !== USUARIO_SIMPLE`),
  renombrado a `puedeGestionar` (3 usos), envuelve también estos botones — así el front refleja
  `ROLES_ESCRITURA` en vez de mostrar botones que dan 403.

## Verificación

- `pnpm --filter api test && pnpm --filter api build`
- `pnpm --filter web typecheck && pnpm --filter web lint`
- En el navegador: con filtro "Niños" activo, exportar xlsx y pdf. Abrir el xlsx: las fechas son
  fechas (no texto), el autofiltro y la fila congelada funcionan, y solo salen los menores.
- Con `USUARIO_SIMPLE`: los botones de exportar no aparecen.

## Terminado cuando

- [ ] `exceljs` agregado a `apps/api`
- [ ] `exportar.xlsx` y `exportar.pdf` declarados antes de `@Get(':id')`, con `ROLES_ESCRITURA`
- [ ] Ambos use-cases reutilizan `construirWhereComensales` + tope `LIMITE_EXPORTACION`
- [ ] `descargarComensales` en `api.ts`, dos botones en la vista con gate `puedeGestionar`
- [ ] El export respeta los filtros activos
- [ ] test, build, typecheck y lint pasan
