-- CreateTable
CREATE TABLE "evidencias_mensuales" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "subidoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidencias_mensuales_anio_mes_idx" ON "evidencias_mensuales"("anio", "mes");

-- AddForeignKey
ALTER TABLE "evidencias_mensuales" ADD CONSTRAINT "evidencias_mensuales_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
