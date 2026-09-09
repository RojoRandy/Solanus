-- CreateTable
CREATE TABLE "eventos_agenda" (
    "id" SERIAL NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_agenda_fechaHora_idx" ON "eventos_agenda"("fechaHora");
