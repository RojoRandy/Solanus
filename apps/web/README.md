# Comedor Solanus — Web

React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui (sobre Base UI). Ver el [README raíz](../../README.md) para instalación y comandos completos del monorepo.

## Convenciones

- **Paleta y tokens**: definidos en `src/index.css` (paleta cálida extraída de los logotipos — vino/marrón sobre crema, nunca gris corporativo ni gradientes morado-rosa).
- **Navegación por rol**: `src/components/layout/nav-config.ts` mapea cada módulo a un ítem de menú; `puedeAcceder()` (de `@comedor-solanus/shared`) filtra qué ve cada rol. La verificación real de permisos siempre vive en el backend — esto es solo UI.
- **Rutas protegidas**: `src/routes/ProtectedRoute.tsx`, opcionalmente con `modulo` para exigir permiso además de sesión.
- **Componentes shadcn/ui**: viven en `src/components/ui/` y no se editan a mano — se regeneran con `npx shadcn add <componente>`.
- **Contrato de API**: tipos compartidos con el backend en `packages/shared` (roles, `AuthenticatedUser`, matriz de permisos).

## Agregar un componente shadcn/ui

```bash
npx shadcn@latest add <componente>
```
