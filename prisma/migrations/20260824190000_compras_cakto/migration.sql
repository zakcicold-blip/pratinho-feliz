-- Compras vindas do webhook da Cakto e o vinculo delas com a assinatura local.
CREATE TABLE "CompraCakto" (
    "id" TEXT NOT NULL,
    "refId" TEXT,
    "evento" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "docLast4" TEXT,
    "valor" DOUBLE PRECISION,
    "produtoNome" TEXT,
    "ofertaId" TEXT,
    "assinaturaId" TEXT,
    "userId" TEXT,
    "liberadaEm" TIMESTAMP(3),
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompraCakto_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CompraCakto_email_idx" ON "CompraCakto"("email");

-- Assinatura passa a guardar tambem o vinculo com a Cakto.
ALTER TABLE "Subscription" ADD COLUMN "caktoAssinaturaId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "caktoRefId" TEXT;
CREATE UNIQUE INDEX "Subscription_caktoAssinaturaId_key" ON "Subscription"("caktoAssinaturaId");
