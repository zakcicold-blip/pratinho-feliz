-- Link de cadastro com acesso de cortesia, gerado no painel admin.
CREATE TABLE "ConviteCortesia" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "motivo" TEXT,
    "maxUsos" INTEGER NOT NULL DEFAULT 1,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "expiraEm" TIMESTAMP(3),
    "revogadoEm" TIMESTAMP(3),
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConviteCortesia_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ConviteCortesia_token_key" ON "ConviteCortesia"("token");
CREATE INDEX "ConviteCortesia_criadoPorId_idx" ON "ConviteCortesia"("criadoPorId");
ALTER TABLE "ConviteCortesia" ADD CONSTRAINT "ConviteCortesia_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- De qual convite veio a cortesia da assinatura (nulo quando veio do botao
-- na lista de usuarios, ou quando o convite for apagado).
ALTER TABLE "Subscription" ADD COLUMN "conviteId" TEXT;
CREATE INDEX "Subscription_conviteId_idx" ON "Subscription"("conviteId");
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_conviteId_fkey" FOREIGN KEY ("conviteId") REFERENCES "ConviteCortesia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
