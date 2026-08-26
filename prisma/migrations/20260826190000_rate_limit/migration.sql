-- Limite de tentativas por janela de tempo.
-- No banco e nao em memoria: cada requisicao serverless pode cair numa
-- instancia diferente, e contador em memoria nao segura ninguem.
CREATE TABLE "RateLimit" (
  "chave"     TEXT NOT NULL,
  "contagem"  INTEGER NOT NULL DEFAULT 0,
  "janelaFim" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("chave")
);

CREATE INDEX "RateLimit_janelaFim_idx" ON "RateLimit"("janelaFim");
