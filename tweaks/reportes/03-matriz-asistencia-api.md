# Paso 3 — Matriz de asistencia (API)

**Estado:** ⬜ pendiente · **Depende de:** paso 2

## Alcance

Reescribir `GET /reportes/asistencia` para que devuelva la matriz comensal × día del mes en vez
de la lista `porDia` actual. Este paso es solo API; la web queda desalineada hasta el paso 5 —
**no desplegar entre ambos**.

## Query Prisma

Una sola consulta, agregación en memoria. `groupBy` de Prisma no sirve aquí: no puede agrupar por
un campo de una relación (`turno.fecha`), y `groupBy([comensalId, turnoId])` ya es único por el
`@@unique` de `Asistencia` — no ahorra nada.

```ts
this.prisma.asistencia.findMany({
  where: { turno: { fecha: { gte: periodo.desde, lt: periodo.hasta } } },
  orderBy: [
    { comensal: { apellidos: 'asc' } },
    { comensal: { nombres: 'asc' } },
    { comensalId: 'asc' },
  ],
  select: {
    comensalId: true,
    comensal: { select: { folio: true, nombres: true, apellidos: true } },
    turno: { select: { fecha: true, horario: true } },
  },
})
```

El `orderBy` por relación deja el `Map` de agregación ya ordenado por inserción — sin `sort`
posterior, a diferencia del `porDia` actual que sí ordena con `localeCompare`.

> **El detalle que rompe todo si se falla:** indexar el día con
> `turno.fecha.getUTCDate()`, **nunca** `.getDate()`. `TurnoComida.fecha` es `@db.Date`, así que
> vuelve como medianoche UTC exacta; `.getDate()` en un huso negativo (México) devuelve el día
> **anterior** y toda la matriz queda corrida un día. Es exactamente el mismo tipo de bug que el
> paso 2 corrige en el rango — aquí hay que evitarlo en el código nuevo.

Sin índice nuevo: `Asistencia` tiene `@@unique([comensalId, turnoId])`, que no ayuda a filtrar
por `turnoId`/`turno.fecha` — Postgres hace seq scan del subquery. El reporte se corre una vez al
mes y son milisegundos incluso con volumen alto; no agregar `@@index([turnoId])` ahora
(`// ponytail:` — si el reporte se siente lento, esa es la respuesta, no antes).

## DTOs — `apps/api/src/modules/reportes/dto/reportes.dto.ts`

Arreglo denso, no mapa disperso — tanto la tabla web (paso 5) como el PDF (paso 7) pintan una
rejilla fija de `diasDelMes` columnas de todos modos; un mapa obligaría a `?? 0` en los dos
consumidores.

```ts
class FilaAsistenciaDto {
  folio: number;
  nombre: string;   // "Apellidos Nombres", ya concatenado — evita repetir el join en 2 consumidores
  dias: number[];   // longitud = diasDelMes; dias[i] = número de turnos ese día (0 si no asistió)
  total: number;    // suma de dias[]
}

class ReporteAsistenciaResponseDto {
  anio: number;
  mes: number;
  diasDelMes: number;        // 28-31, viene de PeriodoMensual — nunca hardcodear 31
  comensales: FilaAsistenciaDto[];  // solo quien asistió >= 1 vez ese mes
  totalesPorDia: number[];   // longitud = diasDelMes, suma de comensales distintos... ver nota
  totalAsistencias: number;
  desayuno: number;
  comida: number;
  cena: number;
}
```

**Nota sobre `totalesPorDia`:** es la suma de `dias[i]` de todos los comensales ese día (total de
*asistencias*, no de comensales distintos — un comensal que fue a desayuno y comida el mismo día
cuenta 2 en el total de ese día, igual que hoy cuenta 2 en los KPIs de horario). Coherente con
que la celda muestra "número de turnos" y no un booleano.

Los KPIs `desayuno`/`comida`/`cena` se conservan tal cual (salen gratis del mismo bucle, contando
por `turno.horario`; las 4 cards de la vista web no cambian). **Se borran** `AsistenciaPorDiaDto`
y el campo `porDia` — la fila de totales de la matriz es exactamente esa información, no tiene
sentido mantener las dos formas.

## Cambios de archivo

- **Reescribir** `apps/api/src/modules/reportes/usecases/reporte-asistencia.usecase.ts`:
  `UseCase<PeriodoMensualQueryDto, ReporteAsistenciaResponseDto>`, usa
  `resolverPeriodoMensual(anio, mes)` del paso 2.
- **Modificar** `apps/api/src/modules/reportes/dto/reportes.dto.ts` con los DTOs de arriba.
- **Modificar** `apps/api/src/modules/reportes/reportes.controller.ts`:
  ```ts
  @Get('asistencia')
  asistencia(@Query() query: PeriodoMensualQueryDto) { ... }
  ```
- **Crear** `apps/api/src/modules/reportes/usecases/reporte-asistencia.usecase.spec.ts` (patrón
  de
  [listar-donativos-dinero.usecase.spec.ts](../../apps/api/src/modules/donativos/usecases/listar-donativos-dinero.usecase.spec.ts)
  — mock de `PrismaService`): fixture con un turno en
  `new Date('2026-09-12T00:00:00.000Z')` y una asistencia sobre él; afirmar que el resultado
  tiene `dias[11] === 1` (índice 11 = día 12, 0-indexado). Es el check que falla de inmediato si
  alguien escribe `.getDate()` en vez de `.getUTCDate()`.

## Terminado cuando

- `pnpm --filter api test` verde, incluyendo el spec nuevo.
- `GET /api/reportes/asistencia?anio=2026&mes=9` en Swagger (`/api/docs`) devuelve la matriz con
  la forma de arriba.

---

> **Hecho:** `reporte-asistencia.usecase.ts` reescrito — `asistencia.findMany` con `orderBy` por
> relación (apellidos, nombres, comensalId), agregación en memoria indexando con
> `turno.fecha.getUTCDate()` (nunca `.getDate()`). DTO nuevo en `dto/reportes.dto.ts`:
> `FilaAsistenciaDto { folio, nombre, dias[], total }` + `ReporteAsistenciaResponseDto { anio,
> mes, diasDelMes, comensales[], totalesPorDia[], totalAsistencias, desayuno, comida, cena }`.
> Se borró `AsistenciaPorDiaDto`/`porDia` (la fila de totales de la matriz es esa misma
> información). Controller: `asistencia(@Query() query: PeriodoMensualQueryDto)`. Spec nuevo con
> 4 casos, incluido el que falla si alguien usa `.getDate()` en vez de `.getUTCDate()`.
> `pnpm --filter api test` (43 ✓) y `build` verdes.
