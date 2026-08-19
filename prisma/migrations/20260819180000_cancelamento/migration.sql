-- Solicitações de cancelamento (fluxo de suporte, aprovadas pelo admin)
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO');

CREATE TABLE "SolicitacaoCancelamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "respostaAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidoEm" TIMESTAMP(3),
    CONSTRAINT "SolicitacaoCancelamento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SolicitacaoCancelamento_status_createdAt_idx" ON "SolicitacaoCancelamento"("status", "createdAt");

ALTER TABLE "SolicitacaoCancelamento" ADD CONSTRAINT "SolicitacaoCancelamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
