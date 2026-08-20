-- Eventos anônimos de comportamento na página (mapa de calor)
CREATE TABLE "HeatEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '/',
    "secao" TEXT,
    "rotulo" TEXT,
    "xRel" DOUBLE PRECISION,
    "yRel" DOUBLE PRECISION,
    "scrollPct" INTEGER,
    "dwellMs" INTEGER,
    "viewport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HeatEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HeatEvent_path_tipo_createdAt_idx" ON "HeatEvent"("path", "tipo", "createdAt");

CREATE INDEX "HeatEvent_createdAt_idx" ON "HeatEvent"("createdAt");
