# Paso 2 — Periodo mensual en la API + límites de fecha correctos

**Estado:** ⬜ pendiente · **Depende de:** paso 0

## Por qué

[apps/api/src/modules/reportes/usecases/rango-fecha.util.ts](../../apps/api/src/modules/reportes/usecases/rango-fecha.util.ts)
mezcla husos horarios:

```ts
export function resolverRangoFecha(desde?: string, hasta?: string): RangoFecha {
  return {
    desde: desde ? new Date(`${desde}T00:00:00.000Z`) : now().startOf('month').toDate(),
    hasta: hasta ? new Date(`${hasta}T23:59:59.999Z`) : now().endOf('day').toDate(),
  };
}
```

Los valores explícitos se interpretan en **UTC**; los defaults salen de `dayjs()` en hora
**local** del servidor. Con `TZ=America/Mexico_City`, el `desde` por defecto de un reporte de
septiembre es `2026-09-01T06:00:00Z`, pero `TurnoComida.fecha` y `DonativoDinero.fecha` son
`@db.Date` — el día 1 se guarda como `2026-09-01T00:00:00Z` exacto. Con `gte 06:00Z` **ese día
desaparece del reporte cada vez que el usuario no toca el filtro**, que es el caso por defecto.

Bug hermano en
[apps/api/src/modules/inventario/usecases/listar-movimientos.usecase.ts](../../apps/api/src/modules/inventario/usecases/listar-movimientos.usecase.ts):
`fecha: { lte: new Date(query.hasta) }` sobre `MovimientoInventario.fecha`, que es un
**timestamp** con hora real. `new Date('2026-09-30')` = `2026-09-30T00:00:00Z`, así que **ningún
movimiento del día `hasta` entra**, pese a que el DTO documenta "inclusive".

La matriz de asistencia (paso 3) y las evidencias (paso 4) necesitan mes/año como unidad nativa,
no un rango arbitrario. Trabajar con enteros (`anio`, `mes`) y `Date.UTC` elimina la clase entera
de bug en vez de parchear cada síntoma.

## Cambios

### Crear `apps/api/src/common/utils/periodo.util.ts`

```ts
export interface PeriodoMensual {
  anio: number;
  mes: number;        // 1-12
  diasDelMes: number; // 28-31
  desde: Date;         // YYYY-MM-01T00:00:00.000Z
  hasta: Date;         // 1° del mes SIGUIENTE — EXCLUSIVO, usar con `lt`, nunca `lte`
  etiqueta: string;    // "Septiembre 2026"
}

export function resolverPeriodoMensual(anio?: number, mes?: number): PeriodoMensual;
```

Todo construido con `Date.UTC(...)`. Los defaults toman **enteros** de `now()` — `.year()`,
`.month() + 1` (dayjs es 0-indexed) — nunca un instante completo; así no hay mezcla de husos que
resolver.

`// ponytail:` en el archivo: los límites son UTC puro, así que un movimiento capturado el último
día del mes después de las ~18:00 hora de México cae en el mes siguiente. Se acepta — el
comedor cierra antes de esa hora en la práctica. Vía de escape si alguien lo reporta: desplazar
los límites de las columnas *timestamp* (no las `@db.Date`) por el offset del comedor.

### Crear `apps/api/src/common/dto/periodo.dto.ts`

```ts
export class PeriodoMensualQueryDto {
  @ApiProperty({ required: false, description: 'Por defecto, el año en curso' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(2000) @Max(2100)
  anio?: number;

  @ApiProperty({ required: false, description: 'Por defecto, el mes en curso (1-12)' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12)
  mes?: number;
}
```

### Crear `apps/api/src/common/utils/periodo.util.spec.ts`

Casos mínimos:
- Febrero bisiesto (2028) → `diasDelMes === 29`; no bisiesto (2026) → `28`.
- Diciembre → `hasta` es el 1° de enero del año **siguiente** (rollover de año).
- Sin argumentos, `desde` cae exactamente a medianoche UTC del día 1 (comparar con
  `Date.UTC(anio, mes - 1, 1)`, no con un `toISOString()` frágil a la hora de ejecución del test).

### Modificar `listar-movimientos.usecase.ts`

Cambiar el límite superior a exclusivo (día siguiente a `hasta`), usando la misma construcción
UTC que `periodo.util.ts` para no introducir un tercer criterio de fechas en el repo. Este
usecase es compartido — el arreglo beneficia tanto a `MovimientosPage` (web) como al reporte de
inventario del paso 5.

### Modificar `rango-fecha.util.ts`

Los defaults pasan a `Date.UTC` (mismo criterio que el nuevo `periodo.util.ts`). Este archivo
**no se borra en este paso** — lo siguen usando `/reportes/inventario` y `/reportes/donativos`
hasta que el paso 5 les pase el rango derivado del período mensual.

## Terminado cuando

```bash
pnpm --filter api test
```
verde, incluyendo `periodo.util.spec.ts`.
