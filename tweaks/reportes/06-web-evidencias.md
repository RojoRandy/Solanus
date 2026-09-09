# Paso 6 — Web: sección Evidencias

**Estado:** ⬜ pendiente · **Depende de:** paso 1 (`api.upload`), paso 4 (endpoints `/evidencias`), paso 5 (selector de periodo montado)

## Alcance

Cuarto tab de `/reportes`: subir fotos del mes/año seleccionado, verlas en rejilla, navegar entre
meses con las flechas del `SelectorMes` (ya existen desde el paso 5), borrar una foto.

## `features/reportes/api.ts` — agregar

```ts
useEvidencias(periodo: Periodo)          // GET /evidencias?anio&mes
useSubirEvidencia(periodo: Periodo)      // POST /evidencias?anio&mes, invalida ['evidencias', periodo]
useEliminarEvidencia(periodo: Periodo)   // DELETE /evidencias/:id, invalida ['evidencias', periodo]
```
`useSubirEvidencia` recibe un `File` y arma el `FormData` internamente, llamando a
`api.upload<EvidenciaResponseDto>(...)` del paso 1.

## `features/reportes/types.ts` — agregar

```ts
export interface Evidencia {
  id: number;
  anio: number;
  mes: number;
  rutaArchivo: string;
  subidoPor: { id: number; nombre: string };
  createdAt: string;
}
```

## Crear `components/EvidenciasView.tsx`

- Input oculto + botón, patrón ya usado en
  [ComensalDetalleView.tsx:235](../../apps/web/src/features/comensales/ComensalDetalleView.tsx):
  ```tsx
  <input
    ref={inputRef}
    type="file"
    multiple
    accept="image/jpeg,image/png,image/webp"
    className="hidden"
    onChange={handleSeleccion}
  />
  <Button onClick={() => inputRef.current?.click()}>Subir fotos</Button>
  ```
  `handleSeleccion` recorre `e.target.files` con un `for` y llama a `useSubirEvidencia().mutate`
  por archivo (subida secuencial o en paralelo con `Promise.allSettled`, decisión libre — dado
  que no hay límite de cantidad, secuencial es más simple y evita saturar la conexión con muchos
  archivos grandes a la vez). Limpiar `e.target.value = ''` al final para poder re-seleccionar el
  mismo archivo.
- Validación de tamaño en cliente **antes** de subir (mensaje claro en vez de dejar que el
  backend responda 413/400): si `file.size > 5 * 1024 * 1024`, toast de error con `sonner`
  (skill `ask-sonner`) y saltar ese archivo sin abortar el resto del lote.
- Rejilla: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3`, cada celda
  `<img src={resolverUrlArchivo(evidencia.rutaArchivo)} className="aspect-video w-full rounded-md object-cover" />`
  (`resolverUrlArchivo` del paso 1).
- Borrar: icono de basura sobre cada foto (visible en hover) → `AlertDialog` de confirmación
  (patrón ya usado en `HistorialDonativos` para borrar un donativo) → `useEliminarEvidencia`.
- Vacío: `EmptyState` (mismo componente que usan asistencia/donativos hoy) con mensaje "Sin
  evidencias para {etiquetaPeriodo(periodo)}".
- Loading: `Skeleton` en rejilla mientras `useEvidencias` carga (patrón de
  `ReporteInventarioView.tsx`, que ya usa `Skeleton` a diferencia de asistencia/donativos).

## Modificar `ReportesPage.tsx`

Montar `<EvidenciasView periodo={periodo} />` en el `TabsContent value="evidencias"` que el
paso 5 dejó como placeholder.

## Terminado cuando

En navegador: subir 3 fotos a un mes, verlas en la rejilla; cambiar de mes con las flechas del
selector → rejilla vacía con el `EmptyState`; volver al mes anterior → las 3 fotos siguen ahí;
borrar una → quedan 2 tras confirmar en el `AlertDialog`.

---

> **Hecho:** `types.ts` gana `Evidencia`; `api.ts` gana `useEvidencias/useSubirEvidencia/
> useEliminarEvidencia` (invalidan `['reportes','evidencias',periodo]`).
> `EvidenciasView.tsx`: input oculto multi-archivo + botón, validación de tipo/tamaño en
> cliente antes de subir (toast por archivo, no aborta el resto del lote), rejilla responsive,
> borrado con `AlertDialog` gated a `esAdministrador` (coincide con `@Auth(ADMINISTRADOR)` del
> DELETE en la API). `ReportesPage.tsx`: tab real montado. `pnpm --filter web typecheck`/`lint`
> limpios (0 errores).
>
> **Verificado en navegador** con datos reales: subida real disparando un evento `change`
> sintético sobre el `<input type=file>` con un `File` construido en JS (no hay diálogo nativo
> de archivos scriptable) → `POST /evidencias 201` → refetch automático → imagen visible en la
> rejilla; borrado con confirmación → toast "Evidencia eliminada" → `EmptyState` correcto.
> Cambio de mes (paso 5) también limpia la rejilla. Un error de consola
> ("EmptyState is not defined") observado durante la edición en vivo resultó ser ruido
> transitorio de React Fast Refresh en esta sesión de HMR, no un bug real — desapareció tras
> reiniciar el servidor y no reaparece en reloads limpios ni en `typecheck`.
