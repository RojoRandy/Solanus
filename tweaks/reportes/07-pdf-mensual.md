# Paso 7 — PDF mensual

**Estado:** ⬜ pendiente · **Depende de:** paso 1 (`api.descargar`), paso 3 (matriz de asistencia), paso 4 (evidencias), paso 5 (donativos en dinero ya en reportes)

## Alcance

`GET /reportes/mensual.pdf?anio&mes` que arma un solo PDF landscape con las 4 secciones:
asistencia (matriz), inventario (movimientos del mes), donativos (donativos en dinero del mes) y
evidencias (fotos, 4 por página).

## `PdfService` — extender

[apps/api/src/common/pdf/pdf.service.ts](../../apps/api/src/common/pdf/pdf.service.ts): agregar
`landscape?: boolean` a las options de `render()`:

```ts
async render(html: string, options?: {
  margin?: { top: string; bottom: string; left: string; right: string };
  landscape?: boolean;   // default false — los PDFs de comensales no cambian
}): Promise<Buffer> {
  // ...
  const pdf = await page.pdf({
    format: 'letter',
    printBackground: true,
    landscape: options?.landscape ?? false,
    margin: options?.margin ?? { ... },
  });
}
```

Todo el reporte va en landscape (decisión, no exploración): la matriz de hasta 31 columnas no
cabe en letter vertical, y Puppeteer **no mezcla orientaciones dentro de un mismo `page.pdf()`**
— concatenar PDFs de distinta orientación exigiría una librería de fusión (`pdf-lib` o similar),
que no se va a agregar por esto. En landscape letter el ancho útil es ~255mm: nombre 55mm + folio
12mm + total 12mm deja 176mm para 31 columnas ≈ 5.7mm cada una, suficiente a fuente 6pt.

## `escapar()` — extraer

Hoy vive privado en
[exportar-comensales-pdf.usecase.ts](../../apps/api/src/modules/comensales/usecases/exportar-comensales-pdf.usecase.ts).
Este paso es el segundo consumidor — momento de sacarlo a
`apps/api/src/common/pdf/html.util.ts` y que ambos usecases lo importen de ahí.

## Crear `apps/api/src/modules/reportes/usecases/reporte-mensual-pdf.usecase.ts`

```ts
export class ReporteMensualPdfUseCase implements UseCase<
  PeriodoMensualQueryDto,
  { buffer: Buffer; filename: string }
> { ... }
```

Constructor inyecta `PrismaService`, `PdfService`, `ReporteAsistenciaUseCase` (reusa la matriz
tal cual construida en el paso 3, no la reimplementa) y `@Inject(STORAGE_SERVICE) IStorageService`
(para las fotos de evidencia).

Movimientos de inventario y donativos en dinero del mes **se consultan por Prisma directo dentro
de este usecase**, no reexportando `ListarMovimientosUseCase`/`ListarDonativosDineroUseCase` de
sus módulos — eso obligaría a importar dos módulos externos y desenvolver `PaginatedDto` solo
para descartar la paginación. Es el mismo patrón que ya usan los otros usecases de esta carpeta
(cruzan dominios libremente vía `PrismaService`). Documentar en un comentario que replica el
`orderBy` y los filtros por defecto de esos dos endpoints, para que no diverjan en silencio si
alguien cambia uno de los dos.

Estructura del HTML — 4 `<section>` con `break-before: page` entre cada una:

1. **Asistencia**: reusa el resultado de `ReporteAsistenciaUseCase.execute()`. Tabla con la misma
   matriz del paso 5/3: `thead { display: table-header-group }` para repetir cabeceras en cada
   página (patrón ya usado en `exportar-comensales-pdf.usecase.ts`). **La fila de totales va como
   último `<tr>` del `<tbody>`, no en `<tfoot>`** — con `table-footer-group` Chromium la repetiría
   al pie de cada página impresa, que no es lo que se quiere (solo un total al final de la
   tabla).
2. **Inventario**: tabla de movimientos del mes (mismas columnas que `MovimientosPage`/paso 5),
   sin paginar — es un documento, no una UI interactiva.
3. **Donativos**: tabla de donativos en dinero del mes con su total.
4. **Evidencias**: fotos del mes en chunks de 4, sin confiar en el auto-break del CSS grid
   (indeterminista entre motores):
   ```ts
   for (let i = 0; i < fotos.length; i += 4) { /* <section class="pagina-fotos"> con fotos.slice(i, i+4) */ }
   ```
   ```css
   .pagina-fotos { break-after: page; display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
   .pagina-fotos figure { break-inside: avoid; height: 82mm; }
   .pagina-fotos img { width: 100%; height: 100%; object-fit: contain; }
   ```

**Tope solo en el PDF, no en la subida** (la subida del paso 4/6 sigue sin límite, como pidió el
usuario): `LIMITE_EVIDENCIAS_PDF = 40` (~10 páginas), mismo patrón que `LIMITE_EXPORTACION` de
`exportar-comensales-pdf.usecase.ts` — si se excede, error catalogado explicando que hay que
reducir el rango o pedir el PDF por partes. Razón: cada foto se embebe como data URI vía
`storage.read()`; 40 fotos × 5MB × 1.37 (overhead de base64) ≈ 270MB de string en el heap de Node
antes de pasarlo a Chromium — con 40 ya es holgado para el tipo de contenedor de Railway, más
que eso arriesga OOM. `// ponytail:` con la vía de escape documentada: servir
`<img src="{PUBLIC_URL}/uploads/...">` (URL pública, no data URI) con
`page.setContent(html, { waitUntil: 'networkidle0' })` — Chromium descarga en streaming y el
heap de Node nunca toca los bytes de las fotos. No construirlo ahora; solo si el tope de 40
resulta insuficiente en la práctica.

Logos: copiar `resolverAssetsDir()` de
[generar-pdf-expediente.usecase.ts](../../apps/api/src/modules/comensales/usecases/generar-pdf-expediente.usecase.ts)
(el comentario sobre la diferencia `ts-node` vs `nest build` en `dist/` es real y aplica igual
aquí).

Nombre de archivo: `reporte-${anio}-${String(mes).padStart(2, '0')}.pdf`.

## `reportes.controller.ts` — agregar endpoint

```ts
@Get('mensual.pdf')
@Header('Content-Type', 'application/pdf')
async mensualPdf(@Query() query: PeriodoMensualQueryDto) {
  const { buffer, filename } = await this.reporteMensualPdf.execute(query);
  return new StreamableFile(buffer, { disposition: `attachment; filename="${filename}"` });
}
```
No hay ruta `:id` en este controller, así que no hay conflicto de orden de rutas que vigilar (a
diferencia de `comensales.controller.ts`, donde `exportar.xlsx`/`exportar.pdf` van antes de
`:id`). `StreamableFile` ya está exento del envoltorio `{data,success,message}` en
[response.interceptor.ts:27](../../apps/api/src/common/interceptors/response.interceptor.ts) —
no reintroducir esa regresión (`apps/api/CLAUDE.md` lo advierte explícitamente).

## `reportes.module.ts` — registrar

Agregar `ReporteMensualPdfUseCase` a `providers`.

## Web — `ReportesPage.tsx`

Botón "Exportar PDF" (agregado como placeholder en el paso 5) ahora funcional:
```ts
onClick={() => api.descargar(`/reportes/mensual.pdf${queryPeriodo(periodo)}`, `reporte-${periodo.anio}-${String(periodo.mes).padStart(2,'0')}.pdf`)}
```
usando `api.descargar` del paso 1 y `queryPeriodo`/el padding de `periodo.ts` del paso 5.

## Terminado cuando

En navegador: con un mes que tenga asistencias, movimientos, donativos y al menos 5 fotos de
evidencia, el botón "Exportar PDF" descarga un archivo que abre con las 4 secciones en orden,
landscape, la matriz de asistencia legible con la fila de totales, y las fotos repartidas de 4 en
4 (2 páginas para 5 fotos).

---

> **Hecho:** `PdfService.render` gana `landscape?: boolean` (default `false`, PDFs de comensales
> sin cambios). `escapar()` extraído a `common/pdf/html.util.ts`, reusado por
> `exportar-comensales-pdf.usecase.ts` y el nuevo usecase. `common/errors/reportes.errors.ts`
> con `DEMASIADAS_EVIDENCIAS_PARA_PDF`. `reporte-mensual-pdf.usecase.ts`: inyecta
> `ReporteAsistenciaUseCase` para la matriz, consulta movimientos/donativos/evidencias por
> Prisma directo (replica orden y filtros de sus endpoints, documentado en comentarios), tope
> `LIMITE_EVIDENCIAS_PDF = 40` antes de leer archivos, fotos en chunks de 4 con
> `break-after: page`, fila de totales de la matriz en `<tbody>` (no `<tfoot>`) para que no se
> repita por página. Endpoint `GET /reportes/mensual.pdf` con `StreamableFile` (ya exento del
> envoltorio). Web: `ExportarPdfButton.tsx` usando `api.descargar`. `pnpm --filter api test`
> (43 ✓) y `build` verdes; `pnpm --filter web typecheck`/`lint` limpios (0 errores).
>
> **Verificado con datos reales** (mismo schema aislado `wt_reportes_066566`): `curl` al
> endpoint devuelve `%PDF-1.4` válido de 470 KB; inspección página por página confirma las 4
> secciones landscape en orden — Asistencia (KPIs + matriz con celda ámbar en el día correcto y
> fila de totales), Inventario (tabla de movimientos), Donativos (tabla con monto y método),
> Evidencias (foto de prueba). Botón "Exportar PDF" en el navegador dispara
> `GET /reportes/mensual.pdf → 200 OK` y el flujo de blob de `api.descargar` sin errores.
