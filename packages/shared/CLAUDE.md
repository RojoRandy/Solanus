# packages/shared

Fuente de verdad de roles, tipos de auth y matriz de permisos, compartidos entre `apps/api` y `apps/web`. Ver reglas globales en [../../CLAUDE.md](../../CLAUDE.md).

- [src/roles.ts](src/roles.ts), [src/permisos.ts](src/permisos.ts), [src/auth.ts](src/auth.ts), exportados desde [src/index.ts](src/index.ts).
- Cambia primero aquí; luego alinea `apps/api` (`@Auth(...roles)`) y `apps/web` (guards de ruta/UI).
- Sin build propio: se exporta TypeScript crudo (`main`/`types` → `src/index.ts`), consumido como `workspace:*`.
