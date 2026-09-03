# apps/api

NestJS 11 + Prisma 6 + PostgreSQL. Ver reglas globales en [../../CLAUDE.md](../../CLAUDE.md) (idioma, graphify, estilo de respuesta).

## Patrón de módulo

- **Un caso de uso por archivo**: `modules/<x>/usecases/<verbo>-<entidad>.usecase.ts`, implementando `UseCase<T, U>` de [use-case.interface.ts](src/common/interfaces/use-case.interface.ts). El controller solo orquesta — no lógica de negocio ahí.
- Errores catalogados en `common/errors/<x>.errors.ts` — no lanzar `HttpException` inline en usecases/controllers.
- Respuestas envueltas en `SchemaResponse` vía [response.interceptor.ts](src/common/interceptors/response.interceptor.ts). **Los binarios (PDF, imágenes) quedan fuera del envoltorio** — regresión ya corregida en `c1323ba`, no reintroducirla.
- Todo endpoint protegido usa `@Auth(...roles)`. **Cualquier módulo nuevo que lo use debe importar `AuthModule`** (registra `PassportModule`). Roles vienen de `@comedor-solanus/shared`.
- DTOs con `class-validator` + `@ApiProperty` (Swagger en `/api/docs`).

## Reusar antes de crear

- [common/utils/date.ts](src/common/utils/date.ts), [common/utils/regex.ts](src/common/utils/regex.ts)
- [common/pdf/pdf.service.ts](src/common/pdf/pdf.service.ts) (Puppeteer, para expedientes PDF)
- [common/storage/local-storage.service.ts](src/common/storage/local-storage.service.ts), [common/uploads/image-upload.interceptor.ts](src/common/uploads/image-upload.interceptor.ts)

## Módulos existentes

`auth`, `usuarios`, `comensales`, `asistencia`, `inventario`, `bienhechores`, `voluntarios`, `dashboard`, `reportes` — en `src/modules/`.

## Prisma

Schema en `prisma/schema.prisma` es el punto de sincronización del proyecto. Tras tocarlo: `pnpm --filter api prisma:migrate`. Seed en `prisma/seed.ts` (usuarios `admin`/`operativo`/`captura`, password `Solanus2026!`).

## Tests

`pnpm --filter api test` (jest, sin BD) · `pnpm --filter api test:e2e` (requiere `pnpm db:up`).

## Variables de entorno

Ver `.env.example`: `DATABASE_URL`, `JWT_SECRET`/`JWT_EXPIRATION`, `JWT_REFRESH_SECRET`/`JWT_REFRESH_EXPIRATION`, `PORT` (3210), `UPLOADS_DIR`, `UPLOADS_PUBLIC_PATH`.
