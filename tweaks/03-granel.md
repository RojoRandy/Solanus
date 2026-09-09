# Paso 3 — Producto a granel

**Estado:** ✅ hecho · **Depende de:** nada

> Hecho: columna `granel Boolean @default(false)` en `lotes_inventario`
> (migración `20260908140000_agregar_granel_lote`); DTOs `RegistrarEntradaDto`/`LoteResponseDto`/
> `LoteVivoResponseDto` y sus mappers; validación `MARCA_NO_PERMITIDA_EN_GRANEL`; checkbox
> "Producto a granel (sin marca)" en `RegistrarEntradaPage` que deshabilita y limpia la marca;
> helper `etiquetaMarcaLote` en `format.ts` → "A granel" en `VarianteDetallePage`, y texto
> equivalente en el selector de lote de `RegistrarAjusteDialog`. typecheck, build y test verdes.

## El problema

`marca` vive en `LoteInventario` ([schema.prisma:255](../apps/api/prisma/schema.prisma)), no en
`Producto`, y ya es opcional. Pero hoy no se distingue "es a granel" (sin marca por naturaleza)
de "se les olvidó capturar la marca". Se pide un checkbox explícito.

"Granel" no existe en ninguna capa del repo hoy (`grep -i granel` → 0 resultados).

## Cambios

### 1. Schema + migración

En `LoteInventario`:

```prisma
granel Boolean @default(false)
```

`pnpm --filter api exec prisma migrate dev --name agregar_granel_lote`

### 2. API

[dto/entrada.dto.ts](../apps/api/src/modules/inventario/dto/entrada.dto.ts) — junto a `marca`
(L68-71):

```ts
@ApiProperty({ required: false, default: false, description: 'Producto a granel: no lleva marca' })
@IsOptional()
@IsBoolean()
granel?: boolean;
```

[registrar-entrada.usecase.ts](../apps/api/src/modules/inventario/usecases/registrar-entrada.usecase.ts):

- Validación simétrica a `MARCA_NO_PERMITIDA_EN_COCIDO` (L95-96): si `dto.granel && dto.marca`,
  lanzar `MARCA_NO_PERMITIDA_EN_GRANEL`.
- En el `create` del lote (L142): `granel: dto.granel ?? false`, y ampliar la línea que ya
  fuerza `marca: undefined` para cocido → también cuando `granel`.
- Incluir `granel` en `LOTE_SELECT` y en `mapLote` para que viaje al front.

[inventario.errors.ts](../apps/api/src/common/errors/inventario.errors.ts) — junto a
`MARCA_NO_PERMITIDA_EN_COCIDO` (L92):

```ts
MARCA_NO_PERMITIDA_EN_GRANEL: () =>
  new ErrorResponseDto('MARCA_NO_PERMITIDA_EN_GRANEL', 'Un producto a granel no lleva marca'),
```

(verificar la firma exacta del helper contra los vecinos del archivo)

### 3. Web

[RegistrarEntradaPage.tsx](../apps/web/src/features/inventario/RegistrarEntradaPage.tsx):

- `granel: z.boolean().optional()` en el schema, `granel: false` en defaultValues.
- `Checkbox` "Producto a granel" junto al campo de marca (~L310).
- El `useEffect` que limpia la marca cuando `estado === 'COCIDO'` (L116-118) se extiende a
  `|| granel`. El campo de marca se oculta con la misma condición que ya usa para cocido (L313).
- Enviar `granel` en el `onSubmit` (L146).
- `granel: boolean` en `RegistrarEntradaInput` (`types.ts:70-87`) y en el tipo `Lote`.

### 4. Mostrar el dato

Donde hoy se imprime `lote.marca ?? '—'`, mostrar `'A granel'` cuando `granel`:

- `features/inventario/VarianteDetallePage.tsx:108`
- `features/asistencia/components/RegistrarAjusteDialog.tsx:40` (etiqueta del selector de lote,
  hoy `` `${l.marca ?? 'Sin marca'} · disponible ${l.cantidadDisponible}` ``)

Helper local pequeño si se repite: `marcaLote(lote) => lote.granel ? 'A granel' : (lote.marca ?? '—')`.

## Verificación

- `pnpm --filter api test && pnpm --filter web typecheck`
- En el navegador: registrar una entrada con "a granel" marcado (sin marca) → guarda sin error;
  la lista de lotes en el detalle de la variante dice "A granel".
- Registrar con "a granel" marcado **y** marca escrita (forzándolo) → error de validación.

## Terminado cuando

- [ ] `granel` está en el schema con su migración
- [ ] La API valida granel ↔ marca y persiste el campo
- [ ] El checkbox funciona en `RegistrarEntradaPage` y oculta el campo de marca
- [ ] Los lotes a granel se muestran como "A granel"
- [ ] test y typecheck pasan
