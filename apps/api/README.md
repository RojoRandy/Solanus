# Comedor Solanus — API

NestJS + Prisma + PostgreSQL. Ver el [README raíz](../../README.md) para instalación y comandos completos del monorepo.

## Convenciones

- **Un caso de uso por archivo**: la lógica de negocio vive en `modules/<x>/usecases/`, nunca en los controllers.
- **Errores catalogados**: cada dominio tiene su `common/errors/<x>.errors.ts` con `Exceptions` (lanza) y `Responses` (documenta en Swagger), estilo `AuthErrors.Exceptions.USER_NOT_FOUND({...})`.
- **Respuesta uniforme**: todo endpoint responde `{ data, success, message }` vía `ApiResponseInterceptor` — no envolver manualmente.
- **Protección de rutas**: `@Auth(...roles)` combina el guard de JWT con `UserRoleGuard`. Puede aplicarse a nivel de método o de controlador completo. Cualquier módulo que lo use debe importar `AuthModule` (expone `PassportModule`), o Nest lanza `AuthGuard ... please import PassportModule` en cada arranque.
- **Prisma**: `prisma/schema.prisma` es el punto de sincronización del proyecto — un solo dueño a la vez (ver sección 3.1 del [Prompt.md](../../Prompt.md)).

## Comandos propios de este paquete

```bash
pnpm prisma:migrate    # nueva migración en desarrollo
pnpm prisma:studio     # explorador visual de la base de datos
pnpm prisma:seed       # re-sembrar datos de ejemplo
```

Swagger disponible en `/api/docs` con el servidor corriendo.
