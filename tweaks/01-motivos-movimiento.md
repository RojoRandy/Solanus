# Paso 1 — Restaurar los motivos de movimiento

**Estado:** ✅ hecho · **Depende de:** nada · **Prioridad:** primero, desbloquea inventario

> Hecho: seed restaurado (motivos + usuarios operativo/captura + bienhechor "Público en General"),
> migración `20260908120000_sembrar_motivos_movimiento` aplicada, y de paso se hizo idempotente el
> sembrado de comensales (`createMany` duplicaba el padrón al re-correr). `pnpm --filter api test` verde.

## El problema

Registrar una entrada falla con "No se encontró el motivo de movimiento".

No es un bug del formulario ni del use-case de entrada. El front **no envía** ningún motivo, y
hace bien: el backend lo deriva del origen del lote (`COMPRADO` → `COMPRA`, `DONADO` →
`DONACION`) mediante el mapa `CLAVE_MOTIVO_POR_ORIGEN` en
[registrar-entrada.usecase.ts:16-19](../apps/api/src/modules/inventario/usecases/registrar-entrada.usecase.ts).
Luego busca ese motivo en la BD:

```ts
// registrar-entrada.usecase.ts:128-129
const motivo = await tx.motivoMovimiento.findUnique({ where: { clave: claveMotivo } });
if (!motivo) throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ clave: claveMotivo });
```

**La tabla `motivos_movimiento` está vacía.** El commit `841e246` borró del seed el bloque que
sembraba los 6 motivos (`grep -i motivo apps/api/prisma/seed.ts` → 0 resultados), y la migración
inicial solo crea la tabla, sin `INSERT`.

## Alcance real del bug

No es solo "Registrar entrada". Todo esto está roto por la misma causa:

| Ruta | Archivo | Busca |
|---|---|---|
| `POST /inventario/entradas` | `registrar-entrada.usecase.ts:128` | `COMPRA` / `DONACION` |
| `POST /inventario/donativos` | `registrar-donativo.usecase.ts:38-39` | `DONACION` |
| `POST /asistencia/turnos/:id/insumos` | `registrar-insumo-turno.usecase.ts:53-60` | `CONSUMO` |
| `POST /inventario/salidas` | `registrar-salida.usecase.ts:48-49` | un `motivoId` que elegir |
| `POST /inventario/ajustes` | `registrar-ajuste.usecase.ts:42-43` | un `motivoId` que elegir |
| Reporte de inventario | `reporte-inventario.usecase.ts:95` | `CADUCADO` |

Y en la web, los `<Select>` de motivo salen vacíos en
`components/RegistrarAjusteDialog.tsx:31` y `components/EditarMovimientoDialog.tsx:29`.

Tampoco hay forma de crearlos desde la app: `crud-catalogos.usecase.ts` solo expone CRUD de
unidades y categorías; de motivos únicamente existe el `GET /inventario/motivos`.

## Cambios

### 1. Restaurar el bloque en el seed

En [apps/api/prisma/seed.ts](../apps/api/prisma/seed.ts), después del bloque de unidades de
medida. Es el bloque original, recuperado con `git show 841e246 -- apps/api/prisma/seed.ts`:

```ts
  // ── Motivos de movimiento ────────────────────────────────────
  await Promise.all(
    [
      { clave: 'COMPRA', nombre: 'Compra' },
      { clave: 'DONACION', nombre: 'Donación' },
      { clave: 'CONSUMO', nombre: 'Consumo en comida' },
      { clave: 'MERMA', nombre: 'Merma', esMerma: true },
      { clave: 'CADUCADO', nombre: 'Caducado', esMerma: true },
      { clave: 'AJUSTE', nombre: 'Ajuste' },
    ].map((m) =>
      prisma.motivoMovimiento.upsert({
        where: { clave: m.clave },
        update: {},
        create: { ...m, esSistema: true },
      }),
    ),
  );
```

Ya era idempotente (`upsert` por `clave`), correr el seed varias veces no duplica nada.

### 2. Migración de datos

El seed no basta: el entorno de Railway (commit `d76f7dc`) ya corrió migraciones sin seed, así
que producción seguiría rota. Crear una migración vacía y escribir el SQL a mano:

```bash
pnpm --filter api exec prisma migrate dev --create-only --name sembrar_motivos_movimiento
```

En el `migration.sql` generado, las 6 filas con `ON CONFLICT DO NOTHING` para que sea seguro en
entornos que ya las tengan:

```sql
INSERT INTO "motivos_movimiento" ("clave", "nombre", "esMerma", "esSistema", "activo") VALUES
  ('COMPRA',   'Compra',            false, true, true),
  ('DONACION', 'Donación',          false, true, true),
  ('CONSUMO',  'Consumo en comida', false, true, true),
  ('MERMA',    'Merma',             true,  true, true),
  ('CADUCADO', 'Caducado',          true,  true, true),
  ('AJUSTE',   'Ajuste',            false, true, true)
ON CONFLICT ("clave") DO NOTHING;
```

Verificar los nombres reales de las columnas contra
[schema.prisma](../apps/api/prisma/schema.prisma) (modelo `MotivoMovimiento`, `@@map("motivos_movimiento")`)
antes de correrla — Prisma usa comillas dobles y camelCase para las columnas sin `@map`.

### 3. Comentario desactualizado

`listar-catalogos.usecase.ts:10` afirma "Catálogos simples de solo lectura (sembrados por
prisma/seed.ts)". Con el paso 1 vuelve a ser cierto; revisarlo y dejarlo consistente.

## Decisión pendiente al ejecutar

El mismo commit `841e246` también borró del seed:

- el bienhechor `Público en General` (`prisma.bienhechor.upsert({ where: { id: 1 }, ... })`),
  útil para donativos anónimos;
- los usuarios `operativo` y `captura`, que [apps/api/CLAUDE.md](../apps/api/CLAUDE.md) todavía
  documenta como existentes.

Ninguno causa el bug. Decidir en el momento: restaurarlos o actualizar el CLAUDE.md para que no
prometa usuarios que no existen.

## Verificación

```bash
pnpm db:up
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
```

Luego, con `preview_start` (config `web`, puerto 5183):

1. Registrar una entrada en `/inventario/registrar-entrada` — debe guardar sin error.
2. Abrir el diálogo de ajuste y el de editar movimiento: los selects de motivo deben venir
   poblados con los 6 motivos.

## Terminado cuando

- [ ] El seed siembra los 6 motivos y es idempotente
- [ ] Existe la migración con `INSERT ... ON CONFLICT DO NOTHING`
- [ ] Se registra una entrada sin error
- [ ] Los selects de motivo no salen vacíos
- [ ] `pnpm --filter api test` pasa
