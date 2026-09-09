# Tweaks — ronda 1

Ajustes pedidos sobre Productos, Inventario, Bienhechores y Comensales, divididos en pasos
autocontenidos. Cada archivo tiene el contexto completo que necesita: rutas exactas, decisiones
ya tomadas y criterio de terminado. Se puede retomar cualquier paso en una sesión nueva sin
releer los demás.

## Estado

| # | Paso | Estado | Depende de |
|---|---|---|---|
| 1 | [Restaurar motivos de movimiento](01-motivos-movimiento.md) — bug bloqueante | ✅ hecho | — |
| 2 | [Productos: editar y quitar código de barras](02-productos.md) | ✅ hecho | — |
| 3 | [Producto a granel](03-granel.md) | ✅ hecho | — |
| 4 | [Donativos en dinero: API](04-donativos-dinero-api.md) | ✅ hecho | — |
| 5 | [Donativos en dinero: Web](05-donativos-dinero-web.md) | ✅ hecho | 4 |
| 6 | [Comensales: filtro por edad](06-comensales-filtro-edad.md) | ✅ hecho | — |
| 7 | [Comensales: exportar a Excel y PDF](07-comensales-exportacion.md) | ✅ hecho | 6 |

Leyenda: ⬜ pendiente · 🔄 en curso · ✅ hecho

**Todos los pasos completados y verificados end-to-end** (2026-09-09).

- `pnpm --filter api test` (34 ✓), `pnpm --filter api build`, `pnpm --filter web typecheck && lint`
  (0 errores), `pnpm --filter web build` — verde.
- Las 6 migraciones aplicadas; seed idempotente; motivos (6), usuarios (admin/operativo/captura)
  y bienhechor "Público en General" presentes.
- Recorrido en navegador (panel integrado, no Playwright): filtro por edad con bordes de
  cumpleaños, export xlsx/pdf respetando filtros, donativo en dinero desde ficha del bienhechor
  y desde Asistencia (linkeado al turno), rol `captura` registra donativo en dinero pero no ve
  historial ni "En especie", "Editar" en tabla de productos sin código de barras, checkbox
  "a granel" deshabilita la marca. Gating de API confirmado con curl (403 donde corresponde).

**Ajustes hechos durante la verificación:**
- `donativo-dinero.mapper.ts`: `fecha` se devuelve como `YYYY-MM-DD` (antes timestamp UTC → se
  mostraba un día antes en zona local).
- `bienhechores.controller.ts`: `GET /bienhechores` y `POST /bienhechores` abiertos a
  `USUARIO_SIMPLE` (los necesita el diálogo de donativo en dinero desde Asistencia para elegir o
  dar de alta al donante). `PATCH`/`DELETE` siguen restringidos.
- `apps/api/.env` (no versionado): `WEB_ORIGIN` ahora incluye `http://localhost:5183` — el puerto
  que usan el preview y los E2E de Playwright.
- `.claude/launch.json`: agregada la config `api` (`nest start --watch`, puerto 3210).

**Playwright:** la suite `apps/web/e2e` no corrió — falta el binario del navegador
(`npx playwright install chromium`). No es una regresión; los specs no se tocaron.

## Decisiones ya tomadas (no volver a discutirlas)

- **Código de barras**: se elimina de raíz (columna de BD incluida). Así los tres formularios
  de alta de producto quedan idénticos — la homologación es por eliminación.
- **Exportación de comensales**: Excel real (`.xlsx`, agregando `exceljs`) **y** PDF.
- **Donativo en dinero**: bienhechor, monto, fecha, nota, método de pago y folio de recibo.
  Sin CFDI.
- **Granel**: campo persistido en el lote, no solo un toggle de UI.

## Hallazgos que cambiaron el alcance

1. **Editar producto ya existe** end-to-end (`PATCH /inventario/productos/:id` +
   `useActualizarProducto` + ruta `/inventario/productos/:id/editar`). Lo que falta es el
   acceso desde la tabla, no la funcionalidad.
2. **El bug de "No se encontró el motivo del movimiento" no está en el use-case de entrada.**
   El commit `841e246` borró los motivos del seed. Rompe entradas, donativos en especie,
   insumos de turno, salidas y ajustes por igual — un solo arreglo los cubre todos.
3. **La tabla de productos ya no muestra el código de barras.** El campo vive en la BD y en
   2 de los 3 formularios de alta.

## Verificación

Antes de marcar un paso ✅:

```bash
pnpm --filter api test
pnpm --filter web lint && pnpm --filter web typecheck
```

Para probar en el navegador: `preview_start` con la config `web` (puerto 5183).
Nunca levantar servidores con Bash.

### Comprobación end-to-end pendiente (requiere BD + `pnpm dev`)

| Paso | Qué probar |
|---|---|
| 1 | Registrar una entrada sin el error de motivo; selects de motivo poblados en ajuste y edición de movimiento |
| 2 | Editar un producto desde la tabla; alta desde `/inventario/productos/nuevo`, el `+` de InsumosTurno y RegistrarEntrada — mismos campos, sin código de barras |
| 3 | Entrada con "a granel" marcado (sin marca) → guarda; el detalle de la variante muestra "A granel". Con granel + marca escrita → error |
| 4-5 | Registrar donativo en dinero desde la ficha del bienhechor y desde Asistencia; historial y total cuadran. Con usuario `captura` (USUARIO_SIMPLE): botón "En dinero" visible en Asistencia, "En especie" no |
| 6 | Filtrar Niños / Adultos mayores; el conteo cambia y vuelve a página 1 |
| 7 | Exportar xlsx y pdf con "Niños" activo; abrir el xlsx: fechas son fechas, autofiltro y fila congelada; solo salen menores |

Al cerrar toda la ronda: `/code-review`, `/security-review` (el paso 7 expone datos personales
en archivos descargables) y `graphify . --update` por los módulos nuevos, commiteando
`graphify-out/`.

## Fuera de alcance a propósito

- Página global de donativos en dinero → la vista agregada va en `/reportes`, que ya existe.
- Anulación / soft-delete de donativos → borrado duro solo para admin.
- Abrir el donativo **en especie** a `USUARIO_SIMPLE` → es otra discusión; aquí solo se
  desbloquea el dinero.
- Grupo etario "adultos (18-59)" y filtro por rango de edad libre.
- Landscape y números de página en el PDF → requieren extender `PdfService`.
- Búsqueda de productos por código de barras → muere con el campo.
