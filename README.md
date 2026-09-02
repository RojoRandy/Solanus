# Comedor Solanus

Sistema de gestión interna del Comedor Comunitario Beato Solanus Casey, operado por los Capuchinos bajo **Amigos de los Capuchinos ABP**.

No es un producto SaaS ni un sitio de marketing: es la herramienta de trabajo diario de administradores y voluntarios para registrar comensales, asistencia, inventario y voluntarios. Ver [Prompt.md](Prompt.md) para el brief funcional completo y el plan de fases.

**Alcance de esta fase**: Comensales, Asistencia, Inventario, Voluntarios, Bienhechores, Dashboard, Reportes y Usuarios del sistema. Estudio Socioeconómico y Despensas quedan diferidos (ver sección 11 del brief).

## Stack

- **Backend** (`apps/api`): NestJS 11 + Prisma + PostgreSQL, JWT + Passport, patrón `UseCase<T,U>`.
- **Frontend** (`apps/web`): React 19 + TypeScript + Vite, Tailwind CSS v4, shadcn/ui sobre Base UI, React Router, React Hook Form + Zod, TanStack Query.
- **Compartido** (`packages/shared`): roles, tipos de auth y matriz de permisos usados por ambas apps.

## Requisitos

- Node.js ≥ 20, pnpm 10
- Docker (para PostgreSQL local)

## Instalación

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Ajusta `apps/api/.env` si el puerto `5442` (Postgres) o `3210` (API) ya están en uso en tu máquina — son puertos no estándar elegidos para evitar choques con otros proyectos locales; en un entorno limpio puedes usar los estándar 5432/3000.

## Base de datos

```bash
pnpm db:up                                    # levanta Postgres (docker-compose.yml)
pnpm --filter api prisma:migrate              # aplica migraciones (crea la BD la primera vez)
pnpm --filter api prisma:seed                 # siembra usuarios de ejemplo, catálogos e inventario inicial
```

El seed crea un usuario por rol (contraseña `Solanus2026!` para los tres):

| Usuario | Rol |
|---|---|
| `admin` | Administrador |
| `operativo` | Usuario |
| `captura` | Usuario simple |

## Desarrollo

```bash
pnpm --filter api dev     # API en http://localhost:3210/api (Swagger en /api/docs)
pnpm --filter web dev     # Frontend en http://localhost:5173
```

O ambos a la vez desde la raíz: `pnpm dev`.

## Tests

```bash
pnpm --filter api test                              # unitarios (no requieren BD)
pnpm --filter api test:e2e                           # e2e (requiere Postgres levantado)
pnpm --filter web lint && pnpm --filter web typecheck
```

## Estructura

```
comedor-solanus/
├── apps/
│   ├── api/    # NestJS + Prisma — prisma/schema.prisma es el punto de sincronización del proyecto
│   └── web/    # React + Vite + Tailwind + shadcn/ui
├── packages/
│   └── shared/ # Roles, tipos de auth y matriz de permisos compartidos
└── docker-compose.yml
```

Convención de módulos en `apps/api`: un caso de uso por archivo (`modules/<x>/usecases/`), errores catalogados en `common/errors/<x>.errors.ts`, respuestas envueltas en `SchemaResponse` vía `ApiResponseInterceptor`. Todo endpoint protegido usa `@Auth(...roles)`; cualquier módulo nuevo que lo use debe importar `AuthModule` (registra `PassportModule`).

## Estado del proyecto

- ✅ Fase 0 — Andamiaje del monorepo
- ✅ Fase 1 — Auth, roles, usuarios del sistema, layout con navegación por rol
- ⏳ Fase 2 — Comensales, Inventario, Voluntarios
- ⏳ Fase 3 — Turno de comida (captura de asistencia con descuento de inventario)
- ⏳ Fase 4 — Dashboard y reportes
- ⏳ Fase 5 — Pulido de UI y E2E con Playwright
