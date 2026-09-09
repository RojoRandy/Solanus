# Tweaks — Reportes (ronda 2)

Reescritura de la página `/reportes`: matriz de asistencia por día, movimientos de inventario en
vez de existencias, donativos en dinero, sección de evidencias fotográficas y export a PDF
mensual con las 4 secciones. Plan completo (contexto, decisiones, riesgos) en el plan file de la
sesión que lo generó; cada paso de abajo es autocontenido y puede retomarse en sesión aparte.

## Estado

| # | Paso | Estado | Depende de |
|---|---|---|---|
| 0 | [Traer main a la rama](00-merge-main.md) | ✅ hecho | — |
| 1 | [api-client: upload y descarga de blobs](01-api-client-upload-descarga.md) | ✅ hecho | 0 |
| 2 | [Periodo mensual en la API + límites de fecha](02-periodo-mensual.md) | ✅ hecho | 0 |
| 3 | [Matriz de asistencia (API)](03-matriz-asistencia-api.md) | ✅ hecho | 2 |
| 4 | [Evidencias (Prisma + módulo API)](04-evidencias-api.md) | ✅ hecho | 2 |
| 5 | [Web: selector mes/año y rewire de los 3 tabs](05-web-selector-mes-y-tabs.md) | ✅ hecho | 1, 3 |
| 6 | [Web: sección Evidencias](06-web-evidencias.md) | ✅ hecho | 1, 4, 5 |
| 7 | [PDF mensual](07-pdf-mensual.md) | ✅ hecho | 1, 3, 4, 5 |

Leyenda: ⬜ pendiente · 🔄 en curso · ✅ hecho

**Todos los pasos completados y verificados end-to-end** (2026-09-09).

- `pnpm --filter api test` (43 ✓), `pnpm --filter api build`, `pnpm --filter web typecheck &&
  lint` (0 errores, 4 warnings preexistentes de `react-hooks/incompatible-library`),
  `pnpm --filter web build` — verde.
- Recorrido completo en navegador (panel integrado, no Playwright) con datos reales sembrados a
  mano: matriz de asistencia con celda ámbar en el día correcto y fila de totales, cambio de mes
  con las flechas (agosto vacío confirma que ya no se pierde el día 1), tabla de movimientos de
  inventario, tabla de donativos en dinero con su total, subida/borrado de evidencias, y el PDF
  mensual descargado con las 4 secciones landscape en orden.
- **Hazard de infraestructura compartida encontrado y evitado:** el Postgres de
  `docker-compose.yml` es un único contenedor compartido por todos los worktrees del host. El
  primer nombre de schema aislado que usé (`reportes_wt`) coincidió con el de otra sesión
  concurrente y aparecieron datos ajenos a mitad de la verificación — se migró a un nombre único
  por worktree (`wt_reportes_066566`) antes de seguir mutando datos. Ninguna migración ni dato
  de otra sesión se tocó a partir de ese punto.
- **Bug real encontrado y corregido durante la verificación:** el `<Select>` de mes/año no tenía
  la prop `items`, así que el trigger cerrado mostraba el valor crudo ("9") en vez de la
  etiqueta ("Septiembre") — Base UI Select necesita `items={{value:label}}` para resolver el
  texto (paso 5).
- **Bugs preexistentes corregidos de paso, documentados en el paso 2:** `resolverRangoFecha`
  perdía el día 1 del mes por defecto (mezcla de husos UTC/local) y
  `ListarMovimientosUseCase` perdía los movimientos del último día del filtro `hasta` (límite
  `lte` sobre una columna timestamp).

## Decisiones ya tomadas (no volver a discutirlas)

- Todo el reporte se filtra por **mes/año**. Se elimina el `RangoFechaPicker` de `/reportes`.
- Matriz de asistencia: filas = comensales que asistieron ese mes (folio + nombre), columnas =
  días del mes, celda ámbar `#FFBF00` con el **número de turnos** (1/2/3) de ese día, última
  columna = total del comensal, última fila = totales por día. **Sin** gran total en la esquina.
- Inventario: la tabla pasa de existencias actuales a **movimientos** del mes.
- Donativos: se agrega la tabla de **donativos en dinero** (modelo `DonativoDinero`, ya en
  `main`); las cards de donativos en especie se conservan como resumen.
- Evidencias: sección nueva, **sin límite duro** de fotos por mes (solo jpg/png/webp, 5 MB —
  límites ya existentes de `ImageUploadInterceptor`).
- PDF mensual con las 4 secciones, landscape, 4 fotos por página.

## Contexto técnico que ya vale para todos los pasos

- Patrón `UseCase<T,U>` — un caso de uso por archivo, controller solo orquesta
  ([apps/api/CLAUDE.md](../../apps/api/CLAUDE.md)).
- Módulo de reportes hoy: `apps/api/src/modules/reportes/` (`reportes.controller.ts`,
  `dto/reportes.dto.ts`, `usecases/{rango-fecha.util,reporte-asistencia,reporte-inventario,
  reporte-donativos}.ts`), `@Auth(ADMINISTRADOR, USUARIO)` a nivel de controller.
- Web hoy: `apps/web/src/features/reportes/` (`ReportesPage.tsx`, `api.ts`, `types.ts`,
  `components/{RangoFechaPicker,ReporteAsistenciaView,ReporteInventarioView,
  ReporteDonativosView}.tsx`).
- Infra reusable en la API: `common/pdf/pdf.service.ts` (Puppeteer, `render(html, {margin})`),
  `common/storage/` (`IStorageService`, token `STORAGE_SERVICE`, @Global),
  `common/uploads/image-upload.interceptor.ts` (`ImageUploadInterceptor(field, maxMb=5)`),
  `common/interceptors/response.interceptor.ts` (exenta `StreamableFile`/`Buffer` del
  envoltorio — no reintroducir esa regresión, ver `apps/api/CLAUDE.md`).
- En web, `src/lib/api-client.ts` es el único punto de red pero fuerza JSON siempre — hoy hay
  `fetch` crudo duplicado para subir/descargar archivos en `features/comensales/api.ts` y
  `features/voluntarios/api.ts`. El paso 1 lo centraliza.

## Verificación al cerrar toda la ronda

```bash
pnpm --filter api test
pnpm --filter api build
pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web build
```

Recorrido en navegador con `preview_start` (config `web`, puerto 5183 — nunca levantar
servidores con Bash). Ver la sección "Verificación" del paso 7 para el checklist end-to-end
completo.

Al cerrar: `/code-review`, `/security-review` (las evidencias son fotos de personas atendidas) y
`graphify . --update` por el módulo `evidencias` nuevo, commiteando `graphify-out/`.

## Fuera de alcance a propósito

- Periodo en la URL (`?anio=&mes=`) para que sobreviva al refresh.
- Caption o descripción por evidencia; reordenarlas.
- Virtualización de la matriz de asistencia; índice `@@index([turnoId])` en `Asistencia`.
- Exportar el reporte mensual a Excel (`exceljs` ya está en el repo, pero no se pidió).
- Orientación mixta en el PDF, números de página, encabezado repetido por página.
