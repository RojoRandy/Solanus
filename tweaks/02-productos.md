# Paso 2 — Productos: editar desde la tabla y eliminar el código de barras

**Estado:** ✅ hecho · **Depende de:** nada

> Hecho: botón "Editar" en cada fila de `ProductosPage`; `codigoBarras` eliminado de schema
> (migración `20260908130000_quitar_codigo_barras_producto`), API y web. Los 3 puntos de alta
> quedan en `{nombre, categoría}`. Se tomó el atajo documentado en 2c: `RegistrarEntradaPage`
> conserva su bloque inline (crea el producto dentro de la transacción del lote) — los campos ya
> coinciden con `NuevoProductoDialog`. typecheck web, build api y test api verdes.

## 2a. Botón "Editar" en la tabla

La funcionalidad de edición ya existe completa: `PATCH /inventario/productos/:id`
(`inventario.controller.ts:310-317`), `useActualizarProducto` (`inventario/api.ts:107-116`) y
la ruta `/inventario/productos/:id/editar` (`InventarioPage.tsx:12-22`). Solo falta el acceso:
hoy únicamente se llega desde `ProductoDetallePage.tsx:52-55`.

En [ProductosPage.tsx](../apps/web/src/features/inventario/ProductosPage.tsx), celda de acciones
(~L152-173, donde hoy está solo "Dar de baja" para admin), agregar antes:

```tsx
<Button variant="ghost" size="sm" render={<Link to={`${producto.id}/editar`} />}>
  Editar
</Button>
```

## 2b. Eliminar `codigoBarras` por completo

Los tres puntos de alta quedan idénticos (nombre + categoría) — homologación por eliminación.

### Schema + migración

- [schema.prisma:203](../apps/api/prisma/schema.prisma) — borrar `codigoBarras String?` del
  modelo `Producto`.
- `pnpm --filter api exec prisma migrate dev --name quitar_codigo_barras_producto`

### API — quitar todas las referencias

- `dto/producto.dto.ts` — L18 (`CrearProductoDto`), L34 (`ActualizarProductoDto`), L77
  (`productoNuevo` dentro del DTO de entrada, revisar)
- `usecases/producto.mapper.ts` — L8, L22
- `usecases/crear-producto.usecase.ts:38`
- `usecases/actualizar-producto.usecase.ts:31`
- `usecases/registrar-entrada.usecase.ts:115` (el `data` del `producto.create`)
- `usecases/registrar-donativo.usecase.ts:55`
- `dto/entrada.dto.ts` y `dto/donativo.dto.ts` — el `codigoBarras?` del sub-objeto
  `productoNuevo`

### Web — quitar todas las referencias

- `features/inventario/types.ts` — L32 (`Producto.codigoBarras`), L40 (`CrearProductoInput`)
- `features/inventario/ProductoFormPage.tsx` — L19 (schema Zod), L53 (defaultValues), L134-136
  (el campo del formulario)
- `features/inventario/ProductoDetallePage.tsx:65-66` (la fila que lo muestra)
- `features/inventario/RegistrarEntradaPage.tsx` — L34 (schema), L138 (submit), L232-234 (campo)

`pnpm --filter web typecheck` y `pnpm --filter api build` señalan lo que falte.

## 2c. Homologar el alta de producto

`RegistrarEntradaPage.tsx` duplica el formulario de "producto nuevo" inline (L200-236) en vez de
usar [NuevoProductoDialog.tsx](../apps/web/src/features/inventario/components/NuevoProductoDialog.tsx),
cuyo docstring (L20) ya afirma —falsamente— que se usa ahí. Con el código de barras fuera los
campos coinciden exactamente (nombre + categoría).

Reemplazar el bloque inline por el diálogo, igual que hacen `InsumosTurno.tsx:100-104` y
`RegistrarDonativoDialog.tsx:242-246`. El `<Tabs>` "Producto existente / Producto nuevo" de
`RegistrarEntradaPage` pasa a: pestaña existente con el combobox + botón `+` que abre
`NuevoProductoDialog` y, al crear, selecciona el producto nuevo (`onCreado`). Queda **un solo**
formulario de alta de producto en toda la app.

Si sale más enredado de lo previsto (el form de entrada mete el producto nuevo en su propio
`useForm`), la alternativa mínima aceptable es dejar el bloque inline pero sin `codigoBarras`
— los campos ya quedan homologados igual. Anotarlo con un comentario `ponytail:` si se toma
ese atajo.

## Verificación

- `pnpm --filter web typecheck && pnpm --filter web lint`
- `pnpm --filter api build`
- En el navegador: editar un producto desde la tabla; dar de alta desde `/inventario/productos/nuevo`,
  desde el `+` de `InsumosTurno` y desde `RegistrarEntradaPage` — los tres con los mismos campos.

## Terminado cuando

- [ ] Hay botón "Editar" en cada fila de la tabla de productos
- [ ] `codigoBarras` no aparece en schema, API ni web (grep global vacío salvo migraciones)
- [ ] La migración `quitar_codigo_barras_producto` existe
- [ ] El alta de producto usa un solo componente (o el atajo documentado)
- [ ] typecheck, lint y build pasan
