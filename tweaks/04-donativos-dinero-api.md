# Paso 4 — Donativos en dinero: API

**Estado:** ✅ hecho · **Depende de:** nada

> Hecho: modelo `DonativoDinero` + enum `MetodoPagoDonativo` + relaciones inversas
> (migración `20260908150000_agregar_donativos_dinero`). Módulo nuevo `apps/api/src/modules/donativos/`
> (controller + 3 use-cases + mapper + DTOs), registrado en `app.module.ts`, importa `AuthModule`.
> Endpoints: `POST /donativos` (ROLES_CAPTURA, incluye USUARIO_SIMPLE), `GET /donativos`
> (ROLES_CONSULTA, con `totalMonto` del aggregate), `DELETE /donativos/:id` (solo ADMIN).
> Error nuevo `DONATIVO_DINERO_NOT_FOUND`. 6 tests nuevos (registrar + listar) verdes; build api ok.
> No toca `MovimientoInventario` — hay test que lo verifica.
>
> Ajuste tras verificación: `mapDonativoDinero` devuelve `fecha` como `YYYY-MM-DD` (string), no
> como `Date`/timestamp UTC — así el front no corre la fecha un día en zona local (`DonativoDineroResponseDto.fecha`
> pasó a `string`).

## Contexto

No existe modelo `Donativo` de ningún tipo. Un donativo **en especie** hoy es un
`LoteInventario` con `origen: DONADO`. Ese modelo exige `varianteId` (FK a producto×unidad×estado)
→ **no admite dinero**. Hace falta un modelo nuevo.

## Módulo propio

`apps/api/src/modules/donativos/` — no dentro de `bienhechores`. Razón: el recurso se lista
global y por turno, y necesita permitir `USUARIO_SIMPLE` en la captura, mientras que
`bienhechores.controller.ts:34` es `@Auth(ADMINISTRADOR, USUARIO)` a nivel de clase.

```
apps/api/src/modules/donativos/
  donativos.module.ts            ← importa AuthModule; registrar en app.module.ts
  donativos.controller.ts
  dto/donativo-dinero.dto.ts
  usecases/registrar-donativo-dinero.usecase.ts
  usecases/listar-donativos-dinero.usecase.ts
  usecases/eliminar-donativo-dinero.usecase.ts
  usecases/donativo-dinero.mapper.ts
  usecases/registrar-donativo-dinero.usecase.spec.ts
```

## Schema

En [schema.prisma](../apps/api/prisma/schema.prisma), sección nueva al final del bloque de
personas. Agregar también las relaciones inversas.

```prisma
enum MetodoPagoDonativo {
  EFECTIVO
  TRANSFERENCIA
  CHEQUE
  DEPOSITO
}

/// Donativo en dinero. No toca inventario: no hay variante, unidad ni movimiento.
/// El donativo en especie sigue siendo un LoteInventario con origen DONADO.
model DonativoDinero {
  id              Int                @id @default(autoincrement())
  bienhechorId    Int
  bienhechor      Bienhechor         @relation(fields: [bienhechorId], references: [id])
  monto           Decimal            @db.Decimal(12, 2)
  fecha           DateTime           @db.Date
  metodoPago      MetodoPagoDonativo
  folioRecibo     String?
  nota            String?
  turnoId         Int?
  turno           TurnoComida?       @relation(fields: [turnoId], references: [id])
  registradoPorId Int
  registradoPor   Usuario            @relation("DonativoDineroRegistradoPor", fields: [registradoPorId], references: [id])
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([fecha])
  @@index([bienhechorId, fecha])
  @@map("donativos_dinero")
}
```

Relaciones inversas: `donativosDinero DonativoDinero[]` en `Bienhechor` y en `TurnoComida`;
`donativosDinero DonativoDinero[] @relation("DonativoDineroRegistradoPor")` en `Usuario`.

Decisiones: `Decimal(12,2)` como `LoteInventario.costoTotal`; `fecha @db.Date` como
`TurnoComida.fecha` (la hora estorba en filtros por rango); `folioRecibo` **sin `@unique`** (los
capturistas escriben "S/N" y series repetidas).

Migración: `pnpm --filter api exec prisma migrate dev --name agregar_donativos_dinero`

### No toca `MovimientoInventario`

`varianteId` y `motivoId` son FK obligatorias, `cantidad` es `Decimal(12,3)` para kilos, y
`motivos_movimiento` es justo la tabla que arregla el paso 1. El único vínculo dinero↔especie
es `Bienhechor`, y eso basta para el reporte agregado.

## DTOs — `dto/donativo-dinero.dto.ts`

```ts
export class RegistrarDonativoDineroDto {
  @ApiProperty() @IsInt() @Min(1) bienhechorId: number;

  @ApiProperty({ example: 1500.5 })
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive()
  monto: number;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD; por defecto hoy' })
  @IsOptional() @IsDateString() fecha?: string;

  @ApiProperty({ enum: MetodoPagoDonativo, enumName: 'MetodoPagoDonativo' })
  @IsEnum(MetodoPagoDonativo) metodoPago: MetodoPagoDonativo;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(50) folioRecibo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(500) nota?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) turnoId?: number;
}

export class ListarDonativosDineroQueryDto extends PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() bienhechorId?: number;
  @IsOptional() @Type(() => Number) @IsInt() turnoId?: number;
  @IsOptional() @IsEnum(MetodoPagoDonativo) metodoPago?: MetodoPagoDonativo;
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
}
```

`DonativoDineroResponseDto`: `monto: number` (con `Number(d.monto)`, como
`reporte-donativos.usecase.ts:60`), `bienhechor {id,nombre}`, `turno {id,fecha,horario} | null`,
`registradoPor {id,nombre}`.

El listado devuelve `PaginatedDto<DonativoDineroResponseDto> & { totalMonto: number }`. El total
sale de un `aggregate({ _sum: { monto: true } })` con el **mismo** `where` (sumar solo la página
daría un número falso en la ficha del bienhechor). `totalMonto` es `0` si `_sum.monto` es `null`.

`usecases/donativo-dinero.mapper.ts` espeja `comensal-select.util.ts`: exporta
`DONATIVO_DINERO_SELECT` y `mapDonativoDinero(d)`.

## Endpoints — `donativos.controller.ts`

Patrón de constantes de `asistencia.controller.ts:45-50`:

```ts
// El donativo en dinero se captura en el punto de servicio: los tres roles lo registran
// desde la pantalla de Turno. Consultar el histórico y borrar quedan reservados.
const ROLES_CAPTURA = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO, UserRoles.USUARIO_SIMPLE];
const ROLES_CONSULTA = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO];
```

| Método | Ruta | Roles |
|---|---|---|
| POST | `/donativos` | `ROLES_CAPTURA` |
| GET | `/donativos` | `ROLES_CONSULTA` (clase) |
| DELETE | `/donativos/:id` | `@Auth(UserRoles.ADMINISTRADOR)` (override) |

Sin `GET /:id` (el listado trae todo) ni `PATCH` (corregir = borrar y recapturar).

## Errores

Reutilizar `InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND` (`inventario.errors.ts:22`) y
`AsistenciaErrors.Exceptions.TURNO_NOT_FOUND`. Único nuevo: `common/errors/donativo.errors.ts`
con `DONATIVO_DINERO_NOT_FOUND` → `NotFoundException` / `'No se encontró el donativo en dinero'`.

## Use-cases

- **registrar**: valida bienhechor → valida turno solo si viene `turnoId` →
  `fecha = dto.fecha ? new Date(dto.fecha) : now().startOf('day').toDate()` → `create` + select.
  Sin `$transaction` (un solo `create`).
- **listar**: arma `where` (bienhechorId, turnoId, metodoPago, `fecha: {gte, lte}`) →
  `Promise.all([findMany, count, aggregate])`.
- **eliminar**: `findUnique` → `DONATIVO_DINERO_NOT_FOUND` → `delete`. Comentario
  `// ponytail: borrado duro; si contabilidad pide rastro, agregar anuladoEn/anuladoPorId.`

## Tests — `registrar-donativo-dinero.usecase.spec.ts`

Patrón de `registrar-insumo-turno.usecase.spec.ts` (prisma falso con `jest.fn()`, sin BD):

1. Crea con `registradoPorId` y `fecha` = hoy cuando el DTO no la trae.
2. `BIENHECHOR_NOT_FOUND` si el bienhechor no existe.
3. `TURNO_NOT_FOUND` si viene `turnoId` inexistente; **no** consulta turno si `turnoId` es undefined.
4. Candado: `expect(prisma.movimientoInventario.create).not.toHaveBeenCalled()` y
   `expect(prisma.motivoMovimiento.findUnique).not.toHaveBeenCalled()`.

## Verificación

- `pnpm --filter api test`
- `pnpm --filter api build`
- Swagger en `/api/docs` muestra los 3 endpoints de `/donativos`.

## Terminado cuando

- [ ] `DonativoDinero` + enum + migración + relaciones inversas
- [ ] Módulo registrado en `app.module.ts`, importa `AuthModule`
- [ ] 3 endpoints con la matriz de roles correcta
- [ ] Listado devuelve `totalMonto` del `aggregate`
- [ ] Los 4 tests pasan
- [ ] `pnpm --filter api test && pnpm --filter api build` pasan
