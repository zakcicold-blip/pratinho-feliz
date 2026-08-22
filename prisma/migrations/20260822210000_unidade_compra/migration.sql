-- Unidade de compra: converte o total do plano em quantidade acionavel na lista.
ALTER TABLE "Ingredient" ADD COLUMN "unidadeCompra" TEXT NOT NULL DEFAULT 'GRAMAS';
ALTER TABLE "Ingredient" ADD COLUMN "gramasCompra" DOUBLE PRECISION;
ALTER TABLE "Ingredient" ADD COLUMN "rotuloCompra" TEXT;
