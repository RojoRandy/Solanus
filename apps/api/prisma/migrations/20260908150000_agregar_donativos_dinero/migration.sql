
-- CreateEnum
CREATE TYPE "MetodoPagoDonativo" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'DEPOSITO');

-- CreateTable
CREATE TABLE "donativos_dinero" (
    "id" SERIAL NOT NULL,
    "bienhechorId" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" DATE NOT NULL,
    "metodoPago" "MetodoPagoDonativo" NOT NULL,
    "folioRecibo" TEXT,
    "nota" TEXT,
    "turnoId" INTEGER,
    "registradoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donativos_dinero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "donativos_dinero_fecha_idx" ON "donativos_dinero"("fecha");

-- CreateIndex
CREATE INDEX "donativos_dinero_bienhechorId_fecha_idx" ON "donativos_dinero"("bienhechorId", "fecha");

-- AddForeignKey
ALTER TABLE "donativos_dinero" ADD CONSTRAINT "donativos_dinero_bienhechorId_fkey" FOREIGN KEY ("bienhechorId") REFERENCES "bienhechores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donativos_dinero" ADD CONSTRAINT "donativos_dinero_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos_comida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donativos_dinero" ADD CONSTRAINT "donativos_dinero_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

