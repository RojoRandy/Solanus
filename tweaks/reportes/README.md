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
