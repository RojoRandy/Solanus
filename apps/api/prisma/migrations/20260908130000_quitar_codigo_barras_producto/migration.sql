-- El código de barras se retira del catálogo: el producto es solo "qué cosa es"
-- (nombre + categoría). No se usaba para buscar ni se mostraba en ninguna tabla.
ALTER TABLE "productos" DROP COLUMN "codigoBarras";
