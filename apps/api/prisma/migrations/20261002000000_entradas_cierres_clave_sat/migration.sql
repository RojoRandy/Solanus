-- Agregar la clave SAT del producto.
ALTER TABLE "productos" ADD COLUMN "claveSat" TEXT;

-- Crear las entradas que agrupan productos registrados juntos.
CREATE TABLE "entradas_inventario" (
    "id" SERIAL NOT NULL,
    "fechaIngreso" DATE NOT NULL,
    "origen" "OrigenLote" NOT NULL,
    "bienhechorId" INTEGER,
    "cfdi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entradas_inventario_pkey" PRIMARY KEY ("id")
);

-- Crear los cierres de inventario.
CREATE TABLE "cierres_inventario" (
    "id" SERIAL NOT NULL,
    "desde" DATE NOT NULL,
    "hasta" DATE NOT NULL,
    "cerradoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierres_inventario_pkey" PRIMARY KEY ("id")
);

-- Crear el índice y las claves foráneas de las tablas nuevas.
CREATE INDEX "entradas_inventario_bienhechorId_idx" ON "entradas_inventario"("bienhechorId");

ALTER TABLE "entradas_inventario" ADD CONSTRAINT "entradas_inventario_bienhechorId_fkey" FOREIGN KEY ("bienhechorId") REFERENCES "bienhechores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cierres_inventario" ADD CONSTRAINT "cierres_inventario_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Conservar el número de lote y sus datos en una entrada por lote existente.
INSERT INTO "entradas_inventario" ("id", "fechaIngreso", "origen", "bienhechorId", "cfdi", "createdAt", "updatedAt")
SELECT "id", "fechaIngreso", "origen", "bienhechorId", "cfdi", "createdAt", "updatedAt" FROM "lotes_inventario";

-- Dejar el siguiente identificador por encima de los datos migrados, incluso sin filas.
SELECT setval(pg_get_serial_sequence('entradas_inventario','id'), COALESCE((SELECT MAX(id) FROM entradas_inventario), 0) + 1, false);

-- Vincular cada lote a su entrada antes de exigir la relación.
ALTER TABLE "lotes_inventario" ADD COLUMN "entradaId" INTEGER;
UPDATE "lotes_inventario" SET "entradaId" = "id";
ALTER TABLE "lotes_inventario" ALTER COLUMN "entradaId" SET NOT NULL;

CREATE INDEX "lotes_inventario_entradaId_idx" ON "lotes_inventario"("entradaId");

ALTER TABLE "lotes_inventario" ADD CONSTRAINT "lotes_inventario_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "entradas_inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- El CFDI ya se conserva en la entrada y aplica a todos sus productos.
ALTER TABLE "lotes_inventario" DROP COLUMN "cfdi";

-- Los motivos de movimiento son catálogo de sistema y el código los busca por `clave`.
-- Idempotente: no pisa filas existentes ni sus nombres editados desde Configuración.
INSERT INTO "motivos_movimiento" ("clave", "nombre", "esMerma", "esSistema", "activo") VALUES
  ('CIERRE_MES', 'Cierre de mes', false, true, true)
ON CONFLICT ("clave") DO NOTHING;
