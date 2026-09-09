# Paso 3 — Base en apps/web: tipos, hooks, estilo de etiqueta, navegación

Estructura nueva: `apps/web/src/features/agenda/` (patrón de `features/usuarios`).

## 3.1 `types.ts`

```ts
export interface EventoAgenda {
  id: number;
  fechaHora: string;
  descripcion: string;
  color: string; // hex #RRGGBB
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearEventoInput {
  fechaHora: string;
  descripcion: string;
  color: string;
}

export type ActualizarEventoInput = Partial<CrearEventoInput> & { activo?: boolean };

export type FiltroAgenda = 'proximos' | 'pasados';
```

## 3.2 `estilo-evento.ts`

Con color hex libre no hay clases Tailwind estáticas que mapear (Tailwind v4 no
detecta clases construidas dinámicamente) — se calcula un `style` inline:

```ts
import type { CSSProperties } from 'react';

/** Fondo tintado al 20% + borde sólido; el texto usa el foreground del tema
 * (no se calcula contraste: el tinte es siempre suave, en claro y oscuro). */
export function estiloEvento(color: string): CSSProperties {
  return { backgroundColor: `${color}33`, borderColor: color };
}
```

## 3.3 `api.ts`

Hooks con TanStack Query, igual que `features/usuarios/api.ts`:

- `useEventosAgenda(filtro: FiltroAgenda)` → `GET /agenda?filtro=…`, `queryKey: ['agenda', filtro]`
- `useCrearEvento`, `useActualizarEvento`, `useEliminarEvento` → invalidan `['agenda']`

## 3.4 Navegación y ruta

- `apps/web/src/components/layout/nav-config.ts`: entrada
  `{ modulo: 'agenda', label: 'Agenda', to: '/agenda', icon: CalendarDays }`
  (icono de `lucide-react`), colocada después de *Turno de comida*.
- `apps/web/src/App.tsx`: dentro de `<ProtectedRoute modulo="agenda" />`,
  `<Route path="/agenda" element={<AgendaPage />} />`.
- `AgendaPage.tsx` provisional: encabezado («Agenda» + descripción) y botón
  *Nuevo evento* deshabilitado. Se completa en los pasos 5 y 6.

## Terminado cuando

- La opción **Agenda** aparece en el menú para administrador y usuario, y no
  para usuario simple.
- `pnpm --filter web lint && pnpm --filter web typecheck` pasan.
