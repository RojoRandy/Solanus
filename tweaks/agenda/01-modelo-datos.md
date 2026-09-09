# Paso 1 — Modelo de datos y contrato compartido

## 1.1 Prisma

`apps/api/prisma/schema.prisma` — nuevo modelo al final de la sección de catálogos:

```prisma
model EventoAgenda {
  id          Int      @id @default(autoincrement())
  fechaHora   DateTime
  descripcion String
  color       String   // hex #RRGGBB — ver packages/shared/src/agenda.ts
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([fechaHora])
  @@map("eventos_agenda")
}
```

```bash
pnpm --filter api prisma:migrate
```

Nombre de migración: `agregar_eventos_agenda`.

## 1.2 packages/shared

Nuevo archivo `packages/shared/src/agenda.ts`:

```ts
/** Presets del color picker de eventos. El usuario también puede elegir cualquier otro hex. */
export const COLORES_EVENTO_PRESET = [
  { hex: '#22C55E', nombre: 'Verde' },
  { hex: '#EAB308', nombre: 'Amarillo' },
  { hex: '#EF4444', nombre: 'Rojo' },
  { hex: '#8B5CF6', nombre: 'Morado' },
  { hex: '#0EA5E9', nombre: 'Azul' },
  { hex: '#F97316', nombre: 'Naranja' },
] as const;

export const COLOR_EVENTO_DEFAULT = COLORES_EVENTO_PRESET[0].hex;

/** Valida el color en el borde de confianza (API) y en el formulario (web). */
export const colorEventoRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * Un evento es "pasado" cuando su día ya quedó atrás. Los eventos de hoy
 * siguen siendo próximos aunque su hora ya pasó: siguen apareciendo en la
 * columna de hoy y siguen siendo editables durante toda la jornada.
 */
export function esEventoPasado(fechaHora: Date | string, ahora: Date = new Date()): boolean {
  const inicioDeHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  return new Date(fechaHora) < inicioDeHoy;
}
```

- `packages/shared/src/index.ts`: agregar `export * from './agenda';`
- `packages/shared/src/permisos.ts`: agregar `'agenda'` al type `Modulo` y
  `agenda: [UserRoles.ADMINISTRADOR, UserRoles.USUARIO]` a `MODULOS_POR_ROL`.
- `packages/shared/CLAUDE.md`: mencionar `src/agenda.ts` en la lista de archivos.

> **`packages/shared` es solo para `apps/web`.** Se exporta como TypeScript
> crudo sin build propio (`main`/`types` → `src/index.ts`); `apps/web` lo
> consume bien porque Vite transpila esos archivos, pero `apps/api` corre con
> `node` puro sobre JS ya compilado por `tsc` y **no puede** `require()` un
> paquete cuyo `main` apunta a un `.ts` sin transpilar (falla con
> `ERR_MODULE_NOT_FOUND` al resolver los imports relativos sin extensión).
> Esto ya es así para los roles: `apps/api/src/common/interfaces/enums.ts`
> reexporta `RolUsuario` directo de Prisma en vez de importar
> `packages/shared`. `colorEventoRegex` y `esEventoPasado` siguen el mismo
> patrón: se duplican en `apps/api/src/common/utils/agenda.ts` con un
> comentario que apunta aquí como fuente canónica. No agregar
> `@comedor-solanus/shared` como dependencia de `apps/api`.

## Terminado cuando

- La migración corre limpia y `prisma generate` expone `prisma.eventoAgenda`.
- `pnpm --filter web typecheck` sigue pasando (el nuevo `Modulo` no rompe nada:
  `NAV_ITEMS` no es exhaustivo sobre `Modulo`, se agrega en el paso 3).
- `apps/api` sigue sin depender de `@comedor-solanus/shared` en tiempo de ejecución.
