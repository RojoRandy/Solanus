# Paso 6 — Comensales: filtro por grupo etario

**Estado:** ✅ hecho · **Depende de:** nada (el paso 7 depende de este)

> Hecho: `rangoFechaNacimiento` + tipo `GrupoEdad` en `edad.util.ts`; `where`/`orderBy` extraídos a
> `comensal-where.util.ts` (con `LIMITE_EXPORTACION`), `listar-comensales.usecase.ts` reducido a usarlos;
> `grupoEdad` en `ListarComensalesQueryDto`; en la web, `<Select>` de grupo etario en
> `ComensalesListView` con centinela `'todas'` y reset de paginación. Spec `comensal-where.util.spec.ts`
> (5 casos, bordes de cumpleaños). 34 tests api verdes, typecheck web ok.

## Contexto

La edad no se persiste; se calcula con `calcularEdad()`
([edad.util.ts:4-10](../apps/api/src/modules/comensales/utils/edad.util.ts) —
`now().diff(fecha, 'year')`) y se inyecta en `mapComensalResponse`. El filtro se traduce a un
rango de `fechaNacimiento` en el `where` de Prisma.

## Cambios

### 1. Helper en `edad.util.ts` (archivo existente, no crear otro)

```ts
export type GrupoEdad = 'ninos' | 'adultos_mayores';

/**
 * Traduce un grupo etario a un rango de `fechaNacimiento`, porque la edad no se
 * persiste. Los cortes se toman al inicio del día para que quien cumple años hoy
 * caiga siempre del mismo lado.
 */
export function rangoFechaNacimiento(grupo: GrupoEdad): { gt?: Date; lte?: Date } {
  const hoy = now().startOf('day');
  return grupo === 'ninos'
    ? { gt: hoy.subtract(18, 'year').toDate() }   // < 18: quien cumple 18 hoy queda fuera
    : { lte: hoy.subtract(60, 'year').toDate() }; // >= 60: quien cumple 60 hoy queda dentro
}
```

`now()` viene de `@/common/utils/date`. Bordes a propósito: quien cumple 18 hoy **no** es niño
(coherente con `esMayorDeEdad`, que ya da `true`). "Más de 60" se implementa como **≥ 60** (la
definición legal mexicana de adulto mayor, la que espera un comedor que tramita INAPAM). Para
estricto: cambiar `60` por `61`.

### 2. Extraer el `where` — `comensal-where.util.ts` (nuevo, junto a `comensal-select.util.ts`)

Hoy el `where` está inline en `listar-comensales.usecase.ts:25-41`. El paso 7 necesita el mismo
sin `skip/take`. Extraer sin cambiar comportamiento:

```ts
import { Prisma } from '@prisma/client';
import type { ListarComensalesQueryDto } from '../dto/comensal.dto';
import { rangoFechaNacimiento } from './edad.util';

export type FiltrosComensales = Pick<
  ListarComensalesQueryDto,
  'activo' | 'busqueda' | 'grupoEdad' | 'ordenarPor' | 'orden'
>;

export function construirWhereComensales(query: FiltrosComensales): Prisma.ComensalWhereInput {
  const where: Prisma.ComensalWhereInput = {
    activo: query.activo === undefined ? true : query.activo === 'true',
  };

  const busqueda = query.busqueda?.trim();
  if (busqueda) {
    const folioBuscado = Number(busqueda);
    where.OR = [
      { nombres: { contains: busqueda, mode: 'insensitive' } },
      { apellidos: { contains: busqueda, mode: 'insensitive' } },
      ...(Number.isInteger(folioBuscado) ? [{ folio: folioBuscado }] : []),
    ];
  }

  if (query.grupoEdad) where.fechaNacimiento = rangoFechaNacimiento(query.grupoEdad);

  return where;
}

export function construirOrderByComensales(
  query: FiltrosComensales,
): Prisma.ComensalOrderByWithRelationInput[] {
  const orden = query.orden ?? 'desc';
  return query.ordenarPor === 'nombre'
    ? [{ nombres: orden }, { apellidos: orden }]
    : [{ folio: orden }];
}

/** Tope de filas por exportación (paso 7): ~13× el padrón actual (≈379). */
export const LIMITE_EXPORTACION = 5000;
```

`listar-comensales.usecase.ts` queda en ~20 líneas usando ambas funciones.

### 3. DTO

En `ListarComensalesQueryDto` ([comensal.dto.ts:83-120](../apps/api/src/modules/comensales/dto/comensal.dto.ts)),
tras el campo `orden`:

```ts
@ApiProperty({
  required: false,
  enum: ['ninos', 'adultos_mayores'],
  description: 'Grupo etario: niños (menores de 18) o adultos mayores (60 o más)',
})
@IsOptional()
@IsIn(['ninos', 'adultos_mayores'])
grupoEdad?: GrupoEdad;
```

Importar `GrupoEdad` de `../utils/edad.util`.

### 4. Web

- `ListarComensalesParams` ([types.ts:52-59](../apps/web/src/features/comensales/types.ts)):
  `grupoEdad?: 'ninos' | 'adultos_mayores'`.
- `construirQueryString` ([api.ts:32-42](../apps/web/src/features/comensales/api.ts)):
  `if (params.grupoEdad) query.set('grupoEdad', params.grupoEdad);`
- [ComensalesListView.tsx](../apps/web/src/features/comensales/ComensalesListView.tsx):
  - `const [grupoEdad, setGrupoEdad] = React.useState<GrupoEdad>();`
  - agregarlo a las deps del `useEffect` de `resetPagina` (L47-50) y al objeto de `useComensales`
    (L64-71)
  - `<Select>` en la barra de filtros (L104-118), patrón de `MovimientosPage.tsx:106-128`:
    centinela `'todas'` → `undefined`, `resetPagina()` en `onValueChange`. Opciones:
    `Todas las edades` / `Niños (menores de 18)` / `Adultos mayores (60+)`.
  - la barra pasa a `flex flex-wrap items-end gap-3` para que quepan búsqueda + select + toggle.
  - bonus barato: el `EmptyState` (L135-150) hoy solo contempla `busqueda`; que mencione también
    el filtro de edad cuando esté activo.

## Test — `comensal-where.util.spec.ts`

`jest.useFakeTimers().setSystemTime(new Date('2026-09-08'))`:

1. Sin `grupoEdad`, el `where` no lleva `fechaNacimiento`.
2. `ninos` → `{ fechaNacimiento: { gt: 2008-09-08 } }`; quien nació el 2008-09-08 queda fuera.
3. `adultos_mayores` → `{ fechaNacimiento: { lte: 1966-09-08 } }`; quien nació el 1966-09-08
   queda dentro.
4. Búsqueda numérica agrega `{ folio }` al `OR`; la no numérica no.

## Verificación

- `pnpm --filter api test && pnpm --filter web typecheck && pnpm --filter web lint`
- En el navegador: filtrar "Niños" y "Adultos mayores"; el total de la paginación cambia y
  vuelve a página 1.

## Terminado cuando

- [ ] `rangoFechaNacimiento` y su spec
- [ ] `where`/`orderBy` extraídos a `comensal-where.util.ts`, `listar-comensales` los usa
- [ ] `grupoEdad` en DTO y en el `where`
- [ ] Select de grupo etario en la web, con reset de paginación
- [ ] test, typecheck y lint pasan
