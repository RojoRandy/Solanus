# Paso 4 — Evidencias (Prisma + módulo API)

**Estado:** ⬜ pendiente · **Depende de:** paso 2

## Modelo Prisma

Agregar a `apps/api/prisma/schema.prisma`:

```prisma
model EvidenciaMensual {
  id          Int      @id @default(autoincrement())
  anio        Int
  mes         Int      // 1..12, validado en el DTO — no CHECK constraint, único escritor es la API
  rutaArchivo String   // ruta pública que devuelve StorageService.save()
  subidoPorId Int
  subidoPor   Usuario  @relation("EvidenciaSubidaPor", fields: [subidoPorId], references: [id])
  createdAt   DateTime @default(now())

  @@index([anio, mes])
  @@map("evidencias_mensuales")
}
```

Y la relación inversa en `model Usuario`:
```prisma
evidenciasSubidas EvidenciaMensual[] @relation("EvidenciaSubidaPor")
```

Decisiones de diseño:
- **Sin `@@unique`**: el requisito es N fotos por mes, no una.
- **`anio`/`mes` como enteros**, no `periodo DateTime @db.Date` — mapean 1:1 con
  `PeriodoMensualQueryDto` del paso 2 y no reintroducen la trampa de medianoche UTC que ese paso
  corrige en otro lado.
- **Sin `descripcion`**: no se pidió pie de foto; se agrega si algún día se pide.

```bash
pnpm --filter api prisma:migrate  # nombre sugerido: agregar_evidencias_mensuales
```

## Módulo `apps/api/src/modules/evidencias/`

Calcado del patrón de `apps/api/src/modules/donativos/` (módulo más reciente del repo, un
usecase por archivo, DTOs en `dto/`).

```
evidencias.module.ts       // imports: [AuthModule] — obligatorio para @Auth
evidencias.controller.ts
dto/evidencia.dto.ts
usecases/
  listar-evidencias.usecase.ts
  subir-evidencia.usecase.ts
  eliminar-evidencia.usecase.ts
```

### Endpoints

```
GET    /evidencias?anio&mes   → EvidenciaResponseDto[]   @Auth(ADMINISTRADOR, USUARIO)
POST   /evidencias?anio&mes   → EvidenciaResponseDto     @Auth(ADMINISTRADOR, USUARIO)
       @ApiConsumes('multipart/form-data')
       @UseInterceptors(ImageUploadInterceptor('foto'))
DELETE /evidencias/:id        → void                     @Auth(ADMINISTRADOR)
```

- **Una foto por request**, no `FilesInterceptor` con array. Reusa
  [ImageUploadInterceptor](../../apps/api/src/common/uploads/image-upload.interceptor.ts) tal
  cual — cero validación nueva (jpeg/png/webp, 5 MB, ya catalogado en `common/errors/common.errors.ts`).
  El front (paso 6) hace el bucle de subida, lo que da progreso y error por archivo en vez de que
  un archivo malo tumbe el lote entero.
- `anio`/`mes` van en **query** (reusan `PeriodoMensualQueryDto` del paso 2), no en el body
  multipart — los campos de un body multipart llegan como string y complican la validación.
- DTO de respuesta:
  ```ts
  export class EvidenciaResponseDto {
    id: number;
    anio: number;
    mes: number;
    rutaArchivo: string;
    subidoPor: { id: number; nombre: string };
    createdAt: Date;
  }
  ```

### `subir-evidencia.usecase.ts`

```ts
export interface SubirEvidenciaArgs {
  anio: number; mes: number;
  file: Express.Multer.File;
  subidoPorId: number;
}
```
Guarda con
```ts
const extension = extensionFromMimeType(file.mimetype);
const rutaArchivo = await this.storage.save(
  `evidencias/${anio}-${String(mes).padStart(2, '0')}`,
  `${Date.now()}.${extension}`,
  file.buffer,
);
```
Nombre único por timestamp — no un nombre fijo como `foto.jpg` de comensales, porque aquí hay N
archivos por carpeta en vez de uno.

### `eliminar-evidencia.usecase.ts`

Orden: primero `prisma.evidenciaMensual.delete({ where: { id } })`, después
`storage.delete(evidencia.rutaArchivo)`. Al revés dejaría una fila apuntando a un archivo que ya
no existe (peor que un archivo huérfano, que es inofensivo y además `LocalStorageService.delete`
ya traga `ENOENT`). Si no existe la fila, usar
`CommonErrors.Exceptions.ARCHIVO_NO_ENCONTRADO` (ya catalogado en `common/errors/common.errors.ts`,
mensaje "El archivo solicitado no existe" — no crear `evidencia.errors.ts` para un solo código).

### Servir las imágenes

No requiere código nuevo: `GET /uploads/*` en
[archivos.controller.ts](../../apps/api/src/common/archivos/archivos.controller.ts) ya resuelve
local vs S3 (redirect 302 firmado) para cualquier `rutaArchivo` bajo `evidencias/...`.

### Registro

Agregar `EvidenciasModule` a los `imports` de `apps/api/src/app.module.ts`.

## Terminado cuando

Desde Swagger (`/api/docs`): subir dos fotos a `anio=2026&mes=9`, `GET /evidencias?anio=2026&mes=9`
devuelve las dos, `DELETE /evidencias/:id` de una de ellas hace que desaparezca de la lista y del
disco/bucket (`uploads/evidencias/2026-09/` en local).
