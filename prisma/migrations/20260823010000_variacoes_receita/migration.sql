-- Variacoes geradas a partir de uma receita base.
ALTER TABLE "Recipe" ADD COLUMN "baseRecipeId" TEXT;
ALTER TABLE "Recipe" ADD COLUMN "variacaoTroca" TEXT;
CREATE INDEX "Recipe_baseRecipeId_idx" ON "Recipe"("baseRecipeId");
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_baseRecipeId_fkey" FOREIGN KEY ("baseRecipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
