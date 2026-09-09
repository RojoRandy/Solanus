# Paso 5 — Donativos en dinero: Web

**Estado:** ✅ hecho · **Depende de:** paso 4

> Hecho: feature nueva `apps/web/src/features/donativos/` (types con `ETIQUETA_METODO_PAGO`, api
> con 3 hooks, `RegistrarDonativoDineroDialog` con RHF+Zod, `HistorialDonativos`). `BienhechorDetallePage`
> con botón "Registrar donativo" + historial y total. `DonativosTurno` montado en `AsistenciaPage`
> **fuera** del guard `puedeVerInsumos` (botón "En dinero" para todos, "En especie" solo con permiso
> de inventario). `InsumosTurno` limpio del botón de donativo. typecheck web ok, lint 0 errores.
>
> Ajuste tras verificación: `GET`/`POST /bienhechores` se abrieron a `USUARIO_SIMPLE` en
> `bienhechores.controller.ts` — sin eso el combobox del diálogo salía vacío para el capturista
> y no podía elegir ni dar de alta al donante. `PATCH`/`DELETE` siguen en ADMIN(+USUARIO).
> Verificado en navegador: el usuario `captura` registra un donativo en dinero linkeado al turno.

## Feature nueva `apps/web/src/features/donativos/`

```
features/donativos/
  types.ts
  api.ts
  components/RegistrarDonativoDineroDialog.tsx
  components/HistorialDonativos.tsx
```

### types.ts

```ts
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' | 'DEPOSITO';

export const ETIQUETA_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
  DEPOSITO: 'Depósito',
};
```

Más `DonativoDinero`, `RegistrarDonativoDineroPayload`, `ListarDonativosParams`. Patrón de
`ETIQUETA_ESTADO` en `features/inventario/types.ts`.

### api.ts

`useDonativosDinero(params, opts?)`, `useRegistrarDonativoDinero()`, `useEliminarDonativoDinero()`.
`queryKey: ['donativos', ...]`. Las mutaciones invalidan `['donativos']` **y** `['bienhechores']`.

Para formatear el monto: `import { formatMoneda } from '@/features/inventario/format'` — ya
existe, no duplicar (hay 2 copias locales en dashboard y reportes; no hacer una tercera).

## Diálogo único — `RegistrarDonativoDineroDialog.tsx`

```ts
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prellena y bloquea el selector cuando se abre desde la ficha del bienhechor. */
  bienhechorId?: number;
  /** Se manda al API cuando la captura viene de la pantalla de Turno. */
  turnoId?: number;
}
```

**RHF + Zod** (convención de `apps/web/CLAUDE.md`, como `BienhechorFormPage.tsx`), no `useState`:
es un formulario plano de 6 campos. El `RegistrarDonativoDialog` de especie usa `useState` porque
tiene líneas dinámicas; este no.

```ts
const schema = z.object({
  bienhechorId: z.number({ error: 'Selecciona el bienhechor' }),
  monto: z.coerce.number().positive('El monto debe ser mayor a cero'),
  fecha: z.string().min(1),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'DEPOSITO']),
  folioRecibo: z.string().max(50).optional(),
  nota: z.string().max(500).optional(),
});
```

Campos: bienhechor (`ComboboxField` de `@/features/inventario/ComboboxField` + botón `+` que abre
`NuevoBienhechorDialog`, como `RegistrarDonativoDialog.tsx:121-129,241`), monto
(`<Input type="number" step="0.01" min="0" inputMode="decimal">` con prefijo `$` como texto — no
hay input de moneda y no vale una librería), fecha (`DatePicker`), método de pago (`Select` con
`ETIQUETA_METODO_PAGO`), folio de recibo (`Input`), nota (`Textarea`).

Éxito → `toast.success(\`Donativo de ${formatMoneda(monto)} registrado.\`)`. Si viene
`bienhechorId` por prop, el combobox va prellenado y deshabilitado.

## (a) + (b) — Bienhechores

[BienhechorDetallePage.tsx](../apps/web/src/features/bienhechores/BienhechorDetallePage.tsx) hoy
son 74 líneas con una sola Card "Datos de contacto".

- Header, junto al botón "Editar" (L49-52): `<Button><HandHeart /> Registrar donativo</Button>`
  que abre el diálogo con `bienhechorId` prellenado.
- Debajo de la Card (L55-71): `<HistorialDonativos bienhechorId={bienhechor.id} />`.
- Quitar `max-w-xl` de la Card de contacto (L55) para que ambas compartan ancho.

### HistorialDonativos.tsx

`{ bienhechorId }` → `Card` con el total donado en el header (`data.totalMonto` → `formatMoneda`),
tabla (fecha, monto, método, folio, quién capturó) y `PaginationControls`. Botón de borrar por
fila **solo para ADMINISTRADOR**, con `AlertDialog` (patrón de `ProductosPage.tsx:152-173`).
`EmptyState` cuando no hay donativos.

## (c) — Asistencia: desenterrar el botón

Hoy el punto de entrada vive en `InsumosTurno.tsx:56-58`, y `AsistenciaPage.tsx:116` solo monta
`<InsumosTurno>` si `puedeAcceder(user.rol, 'inventario')` (L42). `USUARIO_SIMPLE`, que sí
atiende el turno, nunca lo ve. Un donativo tampoco es un insumo.

### Nuevo `features/asistencia/components/DonativosTurno.tsx`

```tsx
export function DonativosTurno({ turnoId }: { turnoId: number }) {
  const { user } = useAuth();
  const puedeVerHistorial = Boolean(user && puedeAcceder(user.rol, 'bienhechores'));
  const puedeEspecie = Boolean(user && puedeAcceder(user.rol, 'inventario'));
  // Card:
  //  - botón "En dinero"  → abre RegistrarDonativoDineroDialog con turnoId (todos los roles)
  //  - botón "En especie" → abre RegistrarDonativoDialog (solo si puedeEspecie)
  //  - lista de donativos en dinero del turno solo si puedeVerHistorial
  //    (useDonativosDinero({ turnoId }, { enabled: puedeVerHistorial }))
}
```

### Modificar

- `AsistenciaPage.tsx` (~L113-117): montar `<DonativosTurno turnoId={turno.id} />` **fuera** del
  guard `puedeVerInsumos`, encima de `{puedeVerInsumos && <InsumosTurno …>}`.
- `InsumosTurno.tsx`: borrar el botón "Registrar donativo" (L56-58), el `<RegistrarDonativoDialog>`
  (L99), el estado `donativoAbierto` (L19) y el import `HandHeart`. El `CardHeader` vuelve a ser
  solo el título.
- `RegistrarDonativoDialog.tsx` (especie) **no se toca**, solo cambia de dueño: ahora lo monta
  `DonativosTurno`.

### Decisiones explícitas

- El donativo **en especie** sigue restringido a `inventario` (capturarlo implica dar de alta
  productos, unidades y variantes — abrirlo es otra discusión).
- `GET /donativos` sigue en ADMIN+USUARIO: `USUARIO_SIMPLE` registra y ve el toast, pero no el
  histórico de montos.

## Sin página global

No se toca `packages/shared/src/permisos.ts` ni se agrega ruta en `App.tsx`. La vista agregada
ya tiene casa en `/reportes` — `reporte-donativos.usecase.ts` puede sumar un `groupBy` sobre
`donativoDinero`. Hacerlo solo si el usuario lo pide.

## Verificación

- `pnpm --filter web typecheck && pnpm --filter web lint`
- En el navegador: registrar donativo desde la ficha del bienhechor (combobox bloqueado) y desde
  Asistencia (combobox libre); el historial y el total cuadran.
- Con un usuario `USUARIO_SIMPLE`: el botón "En dinero" aparece en Asistencia, "En especie" no.

## Terminado cuando

- [ ] `features/donativos/` completo (types, api, 2 componentes)
- [ ] `BienhechorDetallePage` tiene botón de registrar + historial con total
- [ ] `DonativosTurno` montado en Asistencia fuera del guard de inventario
- [ ] `InsumosTurno` limpio del botón de donativo
- [ ] `USUARIO_SIMPLE` puede registrar donativo en dinero desde Asistencia
- [ ] typecheck y lint pasan
