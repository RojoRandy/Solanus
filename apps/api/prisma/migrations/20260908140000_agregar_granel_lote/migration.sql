-- `granel` distingue un lote sin marca por naturaleza (producto a granel) de uno
-- al que simplemente no se le capturó la marca.
ALTER TABLE "lotes_inventario" ADD COLUMN "granel" BOOLEAN NOT NULL DEFAULT false;
