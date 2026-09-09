# Paso 1 — api-client: upload y descarga de blobs

**Estado:** ⬜ pendiente · **Depende de:** paso 0

## Por qué

[apps/web/src/lib/api-client.ts](../../apps/web/src/lib/api-client.ts) es el único punto de red
del proyecto, pero `request()` fuerza `Content-Type: application/json` y siempre hace
`response.json()`. Eso rompe multipart (subir archivos) y blobs (descargar PDF), así que hoy esas
dos cosas se reimplementan con `fetch` crudo, duplicando `API_BASE_URL` y el manejo de error de
`ApiError` en cada sitio:

- [features/comensales/api.ts](../../apps/web/src/features/comensales/api.ts): `subirArchivo`
  (usado por `useSubirFotoComensal`/`useSubirIneFrenteComensal`/`useSubirIneReversoComensal`),
  `descargarExpedientePdf`, `descargarComensales`, más `API_BASE_URL`, `SERVER_ROOT_URL` y
  `resolverUrlArchivo` propios.
- [features/voluntarios/api.ts](../../apps/web/src/features/voluntarios/api.ts): `subirFoto`.
- [features/asistencia/utils.ts](../../apps/web/src/features/asistencia/utils.ts): otra copia de
  la base URL para `resolverFoto()`.

Los pasos 6 (subir evidencias) y 7 (descargar el PDF mensual) necesitan exactamente esto. Sin
centralizarlo, agregarían la quinta y sexta copia del mismo bloque.

## Cambios

### `src/lib/api-client.ts`

1. Dentro de `request()`: no forzar el header de JSON cuando el body ya es `FormData` (el browser
   pone su propio `Content-Type: multipart/form-data; boundary=...`):
   ```ts
   if (!(options.body instanceof FormData)) {
     headers.set('Content-Type', 'application/json');
   }
   ```
2. Extraer a una función compartida `lanzarErrorDeRespuesta(response: Response): Promise<never>`
   el parseo de error que hoy vive inline en `request()` (intenta `.json()` para leer `message`/
   `code`, cae a un mensaje genérico si el body no es JSON) — la van a usar `upload` y `descargar`
   también.
3. Agregar dos métodos a `api`:
   ```ts
   upload<T>(path: string, formData: FormData): Promise<T>
   // POST con body: formData, sin Content-Type manual, mismo manejo de token/error que request()

   descargar(path: string, filename: string): Promise<void>
   // fetch con Authorization: Bearer <token>, response.blob() (si no ok, lanzarErrorDeRespuesta),
   // createObjectURL + <a download=filename> + click() + remove() + revokeObjectURL
   // patrón: descargarExpedientePdf en comensales/api.ts:181-211
   ```
4. Mudar aquí `resolverUrlArchivo(rutaPublica: string): string` (hoy en `comensales/api.ts`) —
   `SERVER_ROOT_URL` ya es derivable de `API_BASE_URL` quitando el sufijo `/api`.

### Sitios a limpiar

- `features/comensales/api.ts`: borrar `subirArchivo`, el cuerpo interno de
  `descargarExpedientePdf`/`descargarComensales` (quedan como wrappers de una línea sobre
  `api.descargar`), `API_BASE_URL`, `SERVER_ROOT_URL`. Si algo importa `resolverUrlArchivo` desde
  aquí, dejar un re-export desde `@/lib/api-client` para no romper importadores — **verificar con
  grep antes**:
  ```bash
  grep -rn "resolverUrlArchivo" apps/web/src
  ```
- `features/voluntarios/api.ts`: `subirFoto` pasa a usar `api.upload`.
- `features/asistencia/utils.ts`: `resolverFoto()` usa `resolverUrlArchivo` de `lib/api-client`
  en vez de su propia constante de base URL.

## Terminado cuando

- `pnpm --filter web typecheck && pnpm --filter web lint` sin errores.
- En navegador (`preview_start` config `web`): subir foto de un comensal, subir foto de un
  voluntario, descargar el expediente PDF de un comensal, exportar comensales a `.xlsx` y a
  `.pdf` — los cuatro flujos siguen funcionando igual que antes del cambio.
- Balance de líneas negativo: `api-client.ts` crece ~40 líneas, los tres features encogen en
  conjunto más que eso.
