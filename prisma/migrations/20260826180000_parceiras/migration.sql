-- Painel de parceiras: quem indica, por qual link, e quanto tem a receber.

ALTER TYPE "PapelUsuario" ADD VALUE 'PARCEIRA';

CREATE TABLE "Parceira" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "nome"        TEXT NOT NULL,
  "codigo"      TEXT NOT NULL,
  "comissaoPct" DOUBLE PRECISION NOT NULL DEFAULT 30,
  "ativa"       BOOLEAN NOT NULL DEFAULT true,
  "observacao"  TEXT,
  "chavePix"    TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Parceira_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Parceira_userId_key" ON "Parceira"("userId");
CREATE UNIQUE INDEX "Parceira_codigo_key" ON "Parceira"("codigo");

ALTER TABLE "Parceira"
  ADD CONSTRAINT "Parceira_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LinkParceira" (
  "id"             TEXT NOT NULL,
  "parceiraId"     TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "rotulo"         TEXT NOT NULL,
  "cliques"        INTEGER NOT NULL DEFAULT 0,
  "ultimoCliqueEm" TIMESTAMP(3),
  "revogadoEm"     TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LinkParceira_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LinkParceira_slug_key" ON "LinkParceira"("slug");
CREATE INDEX "LinkParceira_parceiraId_idx" ON "LinkParceira"("parceiraId");

ALTER TABLE "LinkParceira"
  ADD CONSTRAINT "LinkParceira_parceiraId_fkey"
  FOREIGN KEY ("parceiraId") REFERENCES "Parceira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Indicacao" (
  "id"          TEXT NOT NULL,
  "parceiraId"  TEXT NOT NULL,
  "linkId"      TEXT,
  "userId"      TEXT NOT NULL,
  "comissaoPct" DOUBLE PRECISION NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Indicacao_pkey" PRIMARY KEY ("id")
);

-- userId unico: primeira indicacao vence, e a mesma pessoa nunca gera
-- comissao para duas parceiras.
CREATE UNIQUE INDEX "Indicacao_userId_key" ON "Indicacao"("userId");
CREATE INDEX "Indicacao_parceiraId_createdAt_idx" ON "Indicacao"("parceiraId", "createdAt");

ALTER TABLE "Indicacao"
  ADD CONSTRAINT "Indicacao_parceiraId_fkey"
  FOREIGN KEY ("parceiraId") REFERENCES "Parceira"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Indicacao"
  ADD CONSTRAINT "Indicacao_linkId_fkey"
  FOREIGN KEY ("linkId") REFERENCES "LinkParceira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Indicacao"
  ADD CONSTRAINT "Indicacao_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
