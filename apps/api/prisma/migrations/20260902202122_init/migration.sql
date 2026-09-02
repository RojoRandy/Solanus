-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'USUARIO', 'USUARIO_SIMPLE');

-- CreateEnum
CREATE TYPE "HorarioComida" AS ENUM ('DESAYUNO', 'COMIDA', 'CENA');

-- CreateEnum
CREATE TYPE "MetodoCaptura" AS ENUM ('FOLIO', 'NOMBRE', 'QR', 'FACIAL');

-- CreateEnum
CREATE TYPE "OrigenLote" AS ENUM ('COMPRADO', 'DONADO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comensales" (
    "id" SERIAL NOT NULL,
    "folio" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "curp" TEXT,
    "ineFrontPath" TEXT,
    "ineBackPath" TEXT,
    "fotoPath" TEXT,
    "tutorId" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comensales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartas_uso_imagen" (
    "id" SERIAL NOT NULL,
    "comensalId" INTEGER NOT NULL,
    "firmanteId" INTEGER,
    "autoriza" BOOLEAN NOT NULL DEFAULT false,
    "fechaFirma" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartas_uso_imagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntarios" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fotoPath" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bienhechores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "rfc" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bienhechores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos_comida" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "horario" "HorarioComida" NOT NULL,
    "menu" TEXT,
    "notas" TEXT,
    "registradoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_comida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno_voluntarios" (
    "id" SERIAL NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "voluntarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turno_voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "comensalId" INTEGER NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "metodoCaptura" "MetodoCaptura" NOT NULL DEFAULT 'FOLIO',
    "registradoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_inventario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "abrevia" TEXT NOT NULL,

    CONSTRAINT "unidades_medida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_items" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT,
    "codigoBarras" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "unidadId" INTEGER NOT NULL,
    "presentacion" TEXT,
    "ubicacionId" INTEGER,
    "stockMinimo" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_inventario" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "cantidadInicial" DECIMAL(12,3) NOT NULL,
    "cantidadDisponible" DECIMAL(12,3) NOT NULL,
    "fechaCaducidad" DATE,
    "fechaIngreso" DATE NOT NULL,
    "costoUnitario" DECIMAL(12,2),
    "costoTotal" DECIMAL(12,2),
    "origen" "OrigenLote" NOT NULL,
    "bienhechorId" INTEGER,
    "numeroFactura" TEXT,
    "cfdi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivos_movimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "motivos_movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "loteId" INTEGER,
    "tipo" "TipoMovimiento" NOT NULL,
    "motivoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "turnoId" INTEGER,
    "registradoPorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "comensales_folio_key" ON "comensales"("folio");

-- CreateIndex
CREATE INDEX "comensales_apellidos_nombres_idx" ON "comensales"("apellidos", "nombres");

-- CreateIndex
CREATE UNIQUE INDEX "cartas_uso_imagen_comensalId_key" ON "cartas_uso_imagen"("comensalId");

-- CreateIndex
CREATE INDEX "voluntarios_apellidos_nombres_idx" ON "voluntarios"("apellidos", "nombres");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_comida_fecha_horario_key" ON "turnos_comida"("fecha", "horario");

-- CreateIndex
CREATE UNIQUE INDEX "turno_voluntarios_turnoId_voluntarioId_key" ON "turno_voluntarios"("turnoId", "voluntarioId");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_comensalId_turnoId_key" ON "asistencias"("comensalId", "turnoId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_inventario_nombre_key" ON "categorias_inventario"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_medida_nombre_key" ON "unidades_medida"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_nombre_key" ON "ubicaciones"("nombre");

-- CreateIndex
CREATE INDEX "inventario_items_nombre_idx" ON "inventario_items"("nombre");

-- CreateIndex
CREATE INDEX "lotes_inventario_itemId_fechaCaducidad_idx" ON "lotes_inventario"("itemId", "fechaCaducidad");

-- CreateIndex
CREATE UNIQUE INDEX "motivos_movimiento_nombre_key" ON "motivos_movimiento"("nombre");

-- CreateIndex
CREATE INDEX "movimientos_inventario_itemId_fecha_idx" ON "movimientos_inventario"("itemId", "fecha");

-- AddForeignKey
ALTER TABLE "comensales" ADD CONSTRAINT "comensales_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "comensales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartas_uso_imagen" ADD CONSTRAINT "cartas_uso_imagen_comensalId_fkey" FOREIGN KEY ("comensalId") REFERENCES "comensales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos_comida" ADD CONSTRAINT "turnos_comida_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno_voluntarios" ADD CONSTRAINT "turno_voluntarios_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos_comida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno_voluntarios" ADD CONSTRAINT "turno_voluntarios_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_comensalId_fkey" FOREIGN KEY ("comensalId") REFERENCES "comensales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos_comida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_inventario" ADD CONSTRAINT "lotes_inventario_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventario_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_inventario" ADD CONSTRAINT "lotes_inventario_bienhechorId_fkey" FOREIGN KEY ("bienhechorId") REFERENCES "bienhechores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventario_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes_inventario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_motivoId_fkey" FOREIGN KEY ("motivoId") REFERENCES "motivos_movimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos_comida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
