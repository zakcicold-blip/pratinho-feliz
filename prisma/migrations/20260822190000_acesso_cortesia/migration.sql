-- Acesso de cortesia liberado pelo admin (independe do Stripe).
ALTER TABLE "Subscription" ADD COLUMN "acessoCortesia" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN "cortesiaMotivo" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "cortesiaEm" TIMESTAMP(3);
