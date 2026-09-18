-- El producto pasa de "nombre + categoría" a "presentación única": nombre +
-- marca + contenido + unidad + estado. Dos marcas del mismo artículo son dos
-- productos distintos. VarianteInventario y LoteInventario no cambian de
-- forma; esta migración solo repunta datos existentes al nuevo modelo.

-- (a) Columnas nuevas. `unidadId` queda NULLABLE por ahora: se rellena en el
-- backfill de abajo y se bloquea con NOT NULL al final del archivo.
ALTER TABLE "productos"
  ADD COLUMN "unidadId" INTEGER,
  ADD COLUMN "estado" "EstadoProducto" NOT NULL DEFAULT 'NO_APLICA',
  ADD COLUMN "marca" TEXT,
  ADD COLUMN "granel" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "contenidoCantidad" DECIMAL(12,3),
  ADD COLUMN "contenidoUnidadId" INTEGER;

-- Ya no aplica: ahora conviven varias marcas/presentaciones con el mismo
-- nombre y categoría (la unicidad real se valida en el use-case, sobre la
-- tupla completa, porque las columnas nulables no sirven para un @@unique).
-- Es un índice único, no un constraint de tabla (@@unique de Prisma se
-- implementa así) — DROP CONSTRAINT no lo toca y falla en silencio.
DROP INDEX IF EXISTS "productos_nombre_categoriaId_key";

-- (b) Cada producto toma unidad y estado de su PRIMERA variante (la de id
-- más chico). Es la variante que el producto conserva; las demás se separan
-- en (c).
WITH primera_variante AS (
  SELECT DISTINCT ON (v."productoId") v."productoId", v."unidadId", v.estado
  FROM "variantes_inventario" v
  ORDER BY v."productoId", v.id
)
UPDATE "productos" p
SET "unidadId" = pv."unidadId", "estado" = pv."estado"
FROM primera_variante pv
WHERE pv."productoId" = p.id;

-- Marca y granel del producto: del primer lote (por id) de esa primera
-- variante, si existe alguno.
WITH primer_lote AS (
  SELECT DISTINCT ON (v."productoId") v."productoId", l."marca", l."granel"
  FROM "variantes_inventario" v
  JOIN "lotes_inventario" l ON l."varianteId" = v.id
  ORDER BY v."productoId", l.id
)
UPDATE "productos" p
SET "marca" = pl."marca", "granel" = pl."granel"
FROM primer_lote pl
WHERE pl."productoId" = p.id;

-- (c) Un producto con MÁS de una variante (distintas combinaciones de unidad
-- × estado) no puede seguir siendo un solo producto: se clona el producto
-- por cada variante extra y esa variante se repunta al clon. La variante
-- "original" (primer id) se queda con el producto original.
DO $$
DECLARE
  r RECORD;
  nuevo_id INTEGER;
BEGIN
  FOR r IN
    SELECT v.id AS variante_id, v."productoId" AS producto_id, v."unidadId" AS unidad_id, v."estado" AS estado_variante
    FROM "variantes_inventario" v
    WHERE v.id NOT IN (
      SELECT DISTINCT ON (v2."productoId") v2.id
      FROM "variantes_inventario" v2
      ORDER BY v2."productoId", v2.id
    )
  LOOP
    INSERT INTO "productos" ("nombre", "categoriaId", "unidadId", "estado", "marca", "granel", "activo", "createdAt", "updatedAt")
    SELECT p."nombre", p."categoriaId", r.unidad_id, r.estado_variante, p."marca", p."granel", p."activo", now(), now()
    FROM "productos" p WHERE p.id = r.producto_id
    RETURNING id INTO nuevo_id;

    UPDATE "variantes_inventario" SET "productoId" = nuevo_id WHERE id = r.variante_id;
  END LOOP;
END $$;

-- (d) Dentro de una misma variante (ya 1:1 con su producto tras el paso c),
-- los lotes pueden traer marcas distintas (ej. donaciones de distintas
-- marcas del mismo artículo). El primer lote (por id) ya definió marca/granel
-- del producto en (b); cada lote con marca o granel DISTINTOS se separa a un
-- producto+variante clon, y ese lote (y sus movimientos) se mueven ahí.
DO $$
DECLARE
  r RECORD;
  nuevo_producto_id INTEGER;
  nueva_variante_id INTEGER;
BEGIN
  FOR r IN
    SELECT l.id AS lote_id, v.id AS variante_id, v."productoId" AS producto_id,
           v."unidadId" AS unidad_id, v."estado" AS estado_variante,
           l."marca" AS marca_lote, l."granel" AS granel_lote
    FROM "lotes_inventario" l
    JOIN "variantes_inventario" v ON v.id = l."varianteId"
    JOIN "productos" p ON p.id = v."productoId"
    WHERE l.id <> (
      SELECT l2.id FROM "lotes_inventario" l2
      WHERE l2."varianteId" = v.id
      ORDER BY l2.id LIMIT 1
    )
    AND (l."marca" IS DISTINCT FROM p."marca" OR l."granel" IS DISTINCT FROM p."granel")
  LOOP
    INSERT INTO "productos" ("nombre", "categoriaId", "unidadId", "estado", "marca", "granel", "activo", "createdAt", "updatedAt")
    SELECT p."nombre", p."categoriaId", r.unidad_id, r.estado_variante, r.marca_lote, r.granel_lote, p."activo", now(), now()
    FROM "productos" p WHERE p.id = r.producto_id
    RETURNING id INTO nuevo_producto_id;

    INSERT INTO "variantes_inventario" ("productoId", "unidadId", "estado", "stockMinimo", "activo", "createdAt", "updatedAt")
    VALUES (nuevo_producto_id, r.unidad_id, r.estado_variante, 0, true, now(), now())
    RETURNING id INTO nueva_variante_id;

    UPDATE "lotes_inventario" SET "varianteId" = nueva_variante_id WHERE id = r.lote_id;
    UPDATE "movimientos_inventario" SET "varianteId" = nueva_variante_id WHERE "loteId" = r.lote_id;
  END LOOP;
END $$;

-- (e) Productos sin ninguna variante (huérfanos, si los hay): fallback a
-- NO_APLICA + "pzs", para no dejar unidadId nulo.
UPDATE "productos"
SET "unidadId" = (SELECT id FROM "unidades_medida" WHERE "abrevia" = 'pzs' LIMIT 1),
    "estado" = 'NO_APLICA'
WHERE "unidadId" IS NULL;

-- (f) Ya no debería quedar ningún NULL — se bloquea la columna.
ALTER TABLE "productos" ALTER COLUMN "unidadId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_contenidoUnidadId_fkey" FOREIGN KEY ("contenidoUnidadId") REFERENCES "unidades_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;
