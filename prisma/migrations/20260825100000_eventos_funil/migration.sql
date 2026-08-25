-- Marcos do funil medidos pelo proprio site (visita, checkout, cadastro, compra).
CREATE TABLE "EventoFunil" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "etapa" TEXT NOT NULL,
    "path" TEXT,
    "valor" DOUBLE PRECISION,
    "userId" TEXT,
    "email" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "fbclid" TEXT,
    "referrer" TEXT,
    "viewport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventoFunil_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EventoFunil_etapa_createdAt_idx" ON "EventoFunil"("etapa", "createdAt");
CREATE INDEX "EventoFunil_createdAt_idx" ON "EventoFunil"("createdAt");
CREATE INDEX "EventoFunil_utmCampaign_idx" ON "EventoFunil"("utmCampaign");
CREATE INDEX "EventoFunil_email_idx" ON "EventoFunil"("email");
