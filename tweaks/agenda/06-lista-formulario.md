# Paso 6 — Listado Próximos/Pasados y alta / edición / baja

## 6.1 Listado en `AgendaPage.tsx`

Debajo del calendario, mismo patrón de filtro que
[VoluntariosListView](../../apps/web/src/features/voluntarios/VoluntariosListView.tsx):
grupo de botones en un contenedor `rounded-lg border p-0.5`, `variant="secondary"`
para el activo.

- Opciones: **Próximos** (default) y **Pasados** → `useEventosAgenda(filtro)`.
- Cada evento como fila de `Card`: chip de color con la hora (`estiloEvento`), fecha
  (`d 'de' MMMM 'de' yyyy`), descripción, y a la derecha las acciones.
- Acciones **solo si `filtro === 'proximos'`**: *Editar* (abre el formulario) y
  *Dar de baja* (`AlertDialog` de confirmación → `useEliminarEvento`, toast
  `sonner` de éxito/error). En **Pasados** no se renderiza ninguna acción.
- Vacío: `EmptyState` con `CalendarDays` («Aún no hay eventos próximos» /
  «No hay eventos pasados»).
- Error: `EmptyState` con `TriangleAlert` + botón *Reintentar*.

## 6.2 `components/EventoFormDialog.tsx`

Alta y edición en el mismo diálogo (patrón de
[UsuarioFormDialog](../../apps/web/src/features/usuarios/components/UsuarioFormDialog.tsx)):
RHF + Zod + `sonner`.

Campos:

| Campo | Control | Validación |
|---|---|---|
| Fecha | `DatePicker` de `@/components/ui/date-picker` (guarda `YYYY-MM-DD`) | requerida; al crear, no anterior a hoy |
| Hora | `<input type="time">` nativo dentro de `Input` | requerida |
| Descripción | `Textarea` | `min(1)`, `max(300)` |
| Color | `ColorPicker` del paso 4 (`@/components/shared/ColorPicker`) | `regex(colorEventoRegex)` de `@comedor-solanus/shared`, default `COLOR_EVENTO_DEFAULT` |

- Al enviar se combinan fecha + hora en un `Date` local y se manda
  `fechaHora: fecha.toISOString()`.
- Título: «Nuevo evento» / «Editar evento». Botón: «Crear evento» / «Guardar cambios».
- Se abre desde el botón *Nuevo evento* del encabezado y desde *Editar* en la fila.

## Terminado cuando

- Se puede crear un evento (con preset o color personalizado) y aparece de
  inmediato en el calendario y en el listado.
- Editar y dar de baja funcionan en Próximos; en Pasados no hay botones.
- Un `PATCH`/`DELETE` sobre un evento pasado (probado desde Swagger) responde
  `EVENTO_PASADO_NO_EDITABLE`.
