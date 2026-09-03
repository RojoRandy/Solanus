# comedor-solanus

## Estilo de respuesta

Respuestas claras y concisas, en español. Ve directo al resultado: sin preámbulos, sin resumir al final lo que ya se ve en el diff, sin justificar decisiones de más. Da explicaciones, razones o alternativas **solo si el usuario las pide explícitamente**.

## Graphify — consultar antes de explorar

Este repo tiene un grafo de conocimiento en `graphify-out/` (versionado en git). Ante cualquier pregunta sobre arquitectura, relaciones entre archivos, o "cómo funciona X" / "qué usa Y": primero `graphify query "<pregunta>"` (o `graphify path "A" "B"` / `graphify explain "<nodo>"`). Solo si el grafo no alcanza, explorar con Read/Grep/Explore.

Tras cambios estructurales (módulo nuevo, refactor grande de carpetas): `graphify . --update` y commitear los cambios en `graphify-out/`.

## Qué es esto

Herramienta interna de gestión del **Comedor Comunitario Beato Solanus Casey** (Amigos de los Capuchinos ABP). No es un producto SaaS ni un sitio de marketing — es la herramienta de trabajo diario de administradores y voluntarios. Brief funcional completo en [Prompt.md](Prompt.md); alcance y fases en [README.md](README.md).

**Diferido, no implementar**: Estudio Socioeconómico y Despensas (ver sección 11 de `Prompt.md`).

Los `.xlsx`/`.jpeg` en la raíz son datos reales/de referencia de beneficiarios — no volcarlos a logs, PRs, artifacts ni servicios externos.

## Stack y estructura

Monorepo pnpm (`pnpm@10.14.0`, Node ≥ 20), workspaces `apps/*` y `packages/*`.

| Paquete | Stack |
|---|---|
| [apps/api](apps/api/CLAUDE.md) | NestJS 11 + Prisma 6 + PostgreSQL, JWT + Passport, patrón `UseCase<T,U>` |
| [apps/web](apps/web/CLAUDE.md) | React 19 + TypeScript + Vite, Tailwind CSS v4, shadcn/ui sobre Base UI, React Router 7, RHF + Zod, TanStack Query |
| [packages/shared](packages/shared/CLAUDE.md) | Roles, tipos de auth y matriz de permisos compartidos |

## Comandos

```bash
pnpm install
pnpm db:up                            # Postgres local (docker-compose.yml)
pnpm --filter api prisma:migrate      # migraciones
pnpm --filter api prisma:seed         # usuarios/catálogos de ejemplo
pnpm dev                              # api + web en paralelo
pnpm --filter api test                # unitarios (sin BD)
pnpm --filter api test:e2e            # e2e api (requiere Postgres)
pnpm --filter web lint && pnpm --filter web typecheck
pnpm --filter web test:e2e            # Playwright (apps/web/e2e)
```

**Nunca levantar servidores con Bash.** Usar `preview_start` — `.claude/launch.json` ya define `web` en el puerto 5183.

## Puertos (no estándar, a propósito — no "corregir")

Postgres `5442`, API `3210` (`/api`, Swagger en `/api/docs`), Vite dev `5173` (preview/E2E fijan `5183` con `--strictPort` para no chocar con otros proyectos locales).

## Convenciones

- Dominio, nombres, UI, comentarios y commits en **español**. Commits estilo `tipo: descripción` (`feat:`, `fix:`, `test:`), como en el historial.
- Fuente de verdad del modelo de datos: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma). Fuente de verdad de roles/permisos: [packages/shared](packages/shared/CLAUDE.md) — cambiar ahí antes que en api/web.
- `.env` nunca se commitea (`apps/api/.env.example`, `apps/web/.env.example` son las plantillas).

## Skills y plugins de este proyecto

- **graphify** — siempre, según la regla de arriba.
- Plugin **playwright** (MCP `browser_*`) para escribir/depurar los E2E de `apps/web/e2e`.
- Al tocar `apps/web`: `ui-styling`, `react-best-practices`, `ask-sonner` (toasts con `sonner`), `typography`, `web-design-guidelines`.
- `/code-review` y `/security-review` antes de cerrar una fase o abrir PR.
- `/run` para levantar y verificar la app en el navegador.
- No aplican a este proyecto (herramienta interna, no producto visual/marketing): skills de branding, banners, slides, imagegen, `claude-api`.
