# Paso 5 — Calendario de los próximos 5 días

Referencia visual: la imagen del brief (columnas por día, etiquetas de hora y
descripción con color de fondo, apiladas por hora).

## 5.1 `components/CalendarioProximosDias.tsx`

Un solo componente, sin props obligatorias — se usa igual en Agenda y en Panel
general.

- Datos: `useEventosAgenda('proximos')`. Se agrupa en cliente por día local
  (`YYYY-MM-DD`) sobre los 5 días a partir de hoy.
  `// ponytail: agrupa en cliente sobre todos los próximos; paginar si la agenda crece a cientos de eventos.`
- Layout: `grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5`, cada columna
  una `Card` clickeable (`button` con `hover:bg-muted/50`, `aria-label`
  «Ver eventos del 9 de agosto de 2026»).
- Encabezado de columna: `d - MMMM - yyyy` en español (`date-fns` + locale `es`,
  ya instalados), el día de hoy resaltado.
- Cada evento, en fila: chip de hora (`h:mm a`) + chip de descripción, ambos con
  `style={estiloEvento(evento.color)}` (de `estilo-evento.ts`, paso 3),
  `rounded-md border px-2 py-1 text-xs`.
  La descripción usa `truncate` y va envuelta en `Tooltip`/`TooltipTrigger`/
  `TooltipContent` (`@/components/ui/tooltip`) con el texto completo.
- Orden dentro del día: por `fechaHora` ascendente.
- Día sin eventos: texto centrado `Sin eventos programados`
  (`text-xs text-muted-foreground`).
- Estados: `Skeleton` mientras carga; si falla, una línea discreta
  («No se pudo cargar la agenda») — no bloquear el Panel general por esto.

## 5.2 `components/EventosDelDiaDialog.tsx`

Modal que abre al hacer clic en una columna.

- Props: `fecha: Date | null`, `eventos: EventoAgenda[]`, `onOpenChange`.
- `DialogTitle`: la fecha completa en español («9 de agosto de 2026»).
- Lista vertical: hora + descripción completa (sin truncar), con el chip de
  color (`estiloEvento`) a la izquierda.
- Sin eventos → `EmptyState` breve dentro del modal.

## 5.3 Integraciones

- `AgendaPage.tsx`: `<CalendarioProximosDias />` justo debajo del encabezado.
- `features/dashboard/DashboardPage.tsx`: el mismo componente **arriba de todo**,
  antes de la grilla de `StatCard`.

## Terminado cuando

- El calendario se ve igual en Agenda y en Panel general.
- Una descripción larga se trunca y su tooltip muestra el texto completo.
- Al hacer clic en un día se abre el modal con la fecha en el título y los
  eventos de ese día ordenados por hora.
