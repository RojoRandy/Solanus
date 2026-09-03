# apps/web

React 19 + TypeScript + Vite 8 + Tailwind CSS v4. Ver reglas globales en [../../CLAUDE.md](../../CLAUDE.md) (idioma, graphify, estilo de respuesta).

## Estructura por feature

`src/features/<modulo>/` con `api.ts`, `types.ts`, `<X>Page.tsx`, `<X>...View.tsx`, `components/`. Usar `features/comensales` como referencia del patrón.

- [src/lib/api-client.ts](src/lib/api-client.ts) es el **único** punto de red — no usar `fetch` suelto.
- [src/lib/auth-context.ts](src/lib/auth-context.ts) y [src/routes/ProtectedRoute.tsx](src/routes/ProtectedRoute.tsx) para el guard por rol.

## Tailwind v4 / shadcn

Configuración **CSS-first** vía `@tailwindcss/vite` — no existe `tailwind.config.js`, no crearlo. Tema y variables en `src/index.css` ([components.json](components.json)).

`src/components/ui/` es shadcn sobre **Base UI** (style `base-nova`). Añadir componentes con el CLI `shadcn`, no a mano.

## Librerías clave

| Lib | Uso |
|---|---|
| TanStack Query | estado de servidor / cache |
| React Hook Form + Zod + `@hookform/resolvers` | formularios y validación |
| `sonner` | toasts — usar skill `ask-sonner` |
| `lucide-react` | iconos |
| `next-themes` | tema claro/oscuro |
| `react-day-picker` + `date-fns` | fechas |
| `cmdk` | command palette |
| `class-variance-authority` + `clsx` + `tailwind-merge` | variantes de componentes, helper `cn` en [src/lib/utils.ts](src/lib/utils.ts) |

## Skills

Al trabajar aquí: `ui-styling`, `react-best-practices`, `typography`, `web-design-guidelines`.

## Verificación

```bash
pnpm --filter web lint && pnpm --filter web typecheck
pnpm --filter web test:e2e   # Playwright, e2e/ — requiere API + Postgres arriba
```

E2E existentes: `e2e/login-roles.spec.ts`, `e2e/comensal-expediente.spec.ts`, `e2e/asistencia-descuento.spec.ts`. Usar `preview_start` (config `web` en `.claude/launch.json`, puerto 5183) en vez de Bash para levantar el dev server.

`VITE_API_URL` en `.env.local` (default `http://localhost:3210/api`).
