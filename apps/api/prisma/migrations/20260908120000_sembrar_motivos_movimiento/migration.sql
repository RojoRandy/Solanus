-- Los motivos de movimiento son catálogo de sistema y el código los busca por `clave`
-- (ver registrar-entrada.usecase.ts, registrar-donativo.usecase.ts, etc.). El seed dejó de
-- sembrarlos, así que se restauran aquí para los entornos que ya corrieron migraciones sin seed.
-- Idempotente: no pisa filas existentes ni sus nombres editados desde Configuración.
INSERT INTO "motivos_movimiento" ("clave", "nombre", "esMerma", "esSistema", "activo") VALUES
  ('COMPRA',   'Compra',            false, true, true),
  ('DONACION', 'Donación',          false, true, true),
  ('CONSUMO',  'Consumo en comida', false, true, true),
  ('MERMA',    'Merma',             true,  true, true),
  ('CADUCADO', 'Caducado',          true,  true, true),
  ('AJUSTE',   'Ajuste',            false, true, true)
ON CONFLICT ("clave") DO NOTHING;
