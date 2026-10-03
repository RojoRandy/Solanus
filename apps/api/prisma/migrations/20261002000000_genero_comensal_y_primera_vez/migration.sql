-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('HOMBRE', 'MUJER', 'SIN_ESPECIFICAR');

-- AlterTable
ALTER TABLE "comensales" ADD COLUMN "genero" "Genero" NOT NULL DEFAULT 'SIN_ESPECIFICAR';

-- CreateTable
CREATE TABLE "asistencias_primera_vez" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_primera_vez_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asistencias_primera_vez_turnoId_idx" ON "asistencias_primera_vez"("turnoId");

-- AddForeignKey
ALTER TABLE "asistencias_primera_vez" ADD CONSTRAINT "asistencias_primera_vez_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos_comida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_primera_vez" ADD CONSTRAINT "asistencias_primera_vez_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
