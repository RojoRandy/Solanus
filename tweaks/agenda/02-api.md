# Paso 2 — Módulo `agenda` en apps/api

Copiar el patrón de `modules/voluntarios` (un caso de uso por archivo, errores
catalogados, `@Auth`, `AuthModule` importado).

## 2.1 Errores

`apps/api/src/common/errors/agenda.errors.ts` — mismo formato que
[voluntario.errors.ts](../../apps/api/src/common/errors/voluntario.errors.ts):

- `EVENTO_NOT_FOUND` → `NotFoundException`, «No se encontró el evento»
- `EVENTO_PASADO_NO_EDITABLE` → `BadRequestException`, «Los eventos pasados no se pueden editar ni dar de baja»

## 2.2 Utilidad compartida (duplicada a propósito)

`apps/api/src/common/utils/agenda.ts` — copia de
`packages/shared/src/agenda.ts` con `colorEventoRegex` y `esEventoPasado`,
comentario explicando por qué se duplica (ver nota en el paso 1: `apps/api`
no puede requerir el paquete `shared` en runtime). Mismo patrón que
`common/interfaces/enums.ts` para los roles.

## 2.3 DTOs

`apps/api/src/modules/agenda/dto/evento-agenda.dto.ts`:

- `CrearEventoAgendaDto`: `fechaHora` (`@IsDateString()`, ISO), `descripcion`
  (`@IsNotEmpty() @IsString() @MaxLength(300)`), `color`
  (`@Matches(colorEventoRegex)` importado de `@/common/utils/agenda`).
- `ActualizarEventoAgendaDto`: los tres opcionales + `activo?: boolean`.
- `ListarEventosAgendaQueryDto`: `filtro?: 'proximos' | 'pasados'`
  (`@IsIn(['proximos','pasados'])`, default `proximos`) y `activo?: string`
  (`@IsBooleanString()`, default `'true'`) — igual que voluntarios.
- `EventoAgendaResponseDto`: `id`, `fechaHora`, `descripcion`, `color`, `activo`,
  `createdAt`, `updatedAt`, todos con `@ApiProperty`.

`utils/evento-agenda-select.util.ts` con `eventoAgendaSelect` + `mapEventoAgendaResponse`,
espejo de `voluntario-select.util.ts`.

## 2.4 Casos de uso (`usecases/`)

| Archivo | Comportamiento |
|---|---|
| `crear-evento.usecase.ts` | `prisma.eventoAgenda.create`. |
| `listar-eventos.usecase.ts` | `where: { activo, fechaHora: filtro === 'pasados' ? { lt: inicioDeHoy } : { gte: inicioDeHoy } }`, `orderBy: { fechaHora: filtro === 'pasados' ? 'desc' : 'asc' }`. `inicioDeHoy` calculado una vez en el usecase. |
| `actualizar-evento.usecase.ts` | Busca por id → `EVENTO_NOT_FOUND`; si `esEventoPasado(evento.fechaHora)` → `EVENTO_PASADO_NO_EDITABLE`; luego `update`. |
| `eliminar-evento.usecase.ts` | Misma validación de pasado; baja lógica `activo: false`. |

No se crea `obtener-evento`: la UI edita a partir del elemento que ya trae el listado.

## 2.5 Controller y módulo

`agenda.controller.ts` — `@ApiTags('Agenda')`, `@Controller('agenda')`,
`@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)` a nivel clase:

- `POST /agenda`, `GET /agenda`, `PATCH /agenda/:id`, `DELETE /agenda/:id`
- `@ApiOkSchemaResponse` / `@ApiOkSchemaArrayResponse`, `IdParamDto` en los params.

`agenda.module.ts` con `imports: [AuthModule]` y los 4 usecases como providers.
Registrar `AgendaModule` en `apps/api/src/app.module.ts`.

## 2.6 Test

`usecases/actualizar-evento.usecase.spec.ts` (jest, sin BD, prisma mockeado) —
un solo test: **actualizar un evento con fecha de ayer lanza
`EVENTO_PASADO_NO_EDITABLE`**. Es la única lógica no trivial del módulo.

## Terminado cuando

- `pnpm --filter api test` pasa.
- Swagger en `/api/docs` muestra el grupo **Agenda** con los 4 endpoints.
- `POST /agenda` con `color: "rojo"` (no hex) responde 400 por `@Matches`.
