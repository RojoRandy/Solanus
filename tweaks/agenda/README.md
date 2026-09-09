# Plan — Módulo Agenda

Registro de eventos futuros con fecha/hora, descripción y color de etiqueta, un
calendario de los próximos 5 días (en Agenda y en Panel general) y un listado
filtrable Próximos / Pasados.

## Decisiones tomadas (no re-discutir al ejecutar)

| Tema | Decisión |
|---|---|
| **Color** | Hex libre (`#RRGGBB`) elegido en un `ColorPicker`: Popover con 6 swatches predefinidos + `<input type="color">` nativo para cualquier otro color. Sin dependencias nuevas. |
| **Etiqueta** | Fondo con el color al 20% (`#RRGGBB33`), borde del color sólido, texto `text-foreground`. Legible en claro y oscuro sin cálculo de contraste; es el look de la imagen de referencia. |
| **Presets** | Tailwind 500 saturados (`#22C55E`, `#EAB308`, `#EF4444`, `#8B5CF6`, `#0EA5E9`, `#F97316`) — al 20% dan los pasteles de la imagen. |
| **"Pasado"** | Un evento es pasado si `fechaHora < inicio del día de hoy`. Con esa regla los eventos de hoy por la mañana siguen apareciendo en la columna de hoy y siguen siendo editables. Helper único `esEventoPasado()` en `shared`. |
| **Baja** | Baja lógica (`activo`), igual que voluntarios. Solo eventos próximos. |
| **Enforcement** | El backend rechaza editar/dar de baja eventos pasados. Ocultar el botón en la UI no es suficiente. |
| **Endpoints** | Uno solo de listado (`GET /agenda?filtro=proximos\|pasados`). El calendario de 5 días agrupa en cliente, sin endpoint extra. |
| **Hora** | `<input type="time">` nativo + `DatePicker` ya existente. Sin librería nueva. |
| **Permisos** | `agenda: [ADMINISTRADOR, USUARIO]` (igual que dashboard). |
| **Dashboard** | Reusa el mismo componente `CalendarioProximosDias`, sin tocar la API de dashboard. |

## Pasos

1. [01-modelo-datos.md](01-modelo-datos.md) — Prisma + `packages/shared`
2. [02-api.md](02-api.md) — módulo NestJS `agenda`
3. [03-web-base.md](03-web-base.md) — tipos, hooks, estilo de etiqueta, navegación y ruta
4. [04-color-picker.md](04-color-picker.md) — componente `ColorPicker` compartido
5. [05-calendario.md](05-calendario.md) — calendario de 5 días + modal del día + Panel general
6. [06-lista-formulario.md](06-lista-formulario.md) — listado Próximos/Pasados + alta/edición/baja
7. [07-verificacion.md](07-verificacion.md) — lint, typecheck, tests, navegador, graphify

Ejecutar en orden: cada paso deja el repo compilando.
