-- CreateEnum
CREATE TYPE "Praticidade" AS ENUM ('MUITO_RAPIDO', 'EQUILIBRADO', 'PODE_COZINHAR_MAIS');

-- CreateEnum
CREATE TYPE "Objetivo" AS ENUM ('ORGANIZAR_ROTINA', 'VARIAR_CARDAPIO', 'APRESENTAR_NOVOS_ALIMENTOS', 'REDUZIR_IMPROVISO');

-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('CAFE_DA_MANHA', 'ALMOCO', 'LANCHE', 'JANTAR');

-- CreateEnum
CREATE TYPE "StatusPreferencia" AS ENUM ('ACEITA', 'RECUSA', 'DESEJADA', 'RESTRICAO');

-- CreateEnum
CREATE TYPE "EstadoFeedback" AS ENUM ('GOSTOU', 'ACEITOU', 'EXPERIMENTOU', 'RECUSOU');

-- CreateEnum
CREATE TYPE "StatusSlot" AS ENUM ('PLANEJADO', 'TROCADO', 'FORA_DE_CASA', 'SEM_TEMPO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "PlanoAssinatura" AS ENUM ('ESSENCIAL', 'FAMILIA');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('TESTE', 'ATIVA', 'CANCELADA', 'CARENCIA');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('RESPONSAVEL', 'ADMIN');

-- CreateEnum
CREATE TYPE "QualidadeSono" AS ENUM ('BOA', 'REGULAR', 'RUIM');

-- CreateEnum
CREATE TYPE "NivelDisposicao" AS ENUM ('BAIXA', 'NORMAL', 'ALTA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "PapelUsuario" NOT NULL DEFAULT 'RESPONSAVEL',
    "lembretes" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "faixaEtaria" TEXT NOT NULL,
    "refeicoesPorDia" INTEGER NOT NULL DEFAULT 4,
    "tempoDisponivel" INTEGER NOT NULL DEFAULT 30,
    "praticidade" "Praticidade" NOT NULL DEFAULT 'EQUILIBRADO',
    "objetivo" "Objetivo" NOT NULL DEFAULT 'ORGANIZAR_ROTINA',
    "equipamentos" TEXT,
    "horarioDormirHabitual" TEXT,
    "horarioAcordarHabitual" TEXT,
    "consentimentoLgpd" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodPreference" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "status" "StatusPreferencia" NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "tipoRefeicao" "TipoRefeicao" NOT NULL,
    "tempoPreparoMin" INTEGER NOT NULL,
    "dificuldade" TEXT NOT NULL,
    "rendimento" TEXT NOT NULL,
    "passos" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "restricoes" TEXT NOT NULL,
    "nutricao" TEXT NOT NULL DEFAULT '',
    "idadeMinimaMeses" INTEGER NOT NULL DEFAULT 6,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantidade" TEXT NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "cicloNumero" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealSlot" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "recipeId" TEXT,
    "status" "StatusSlot" NOT NULL DEFAULT 'PLANEJADO',
    "explicacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealFeedback" (
    "id" TEXT NOT NULL,
    "mealSlotId" TEXT NOT NULL,
    "estado" "EstadoFeedback" NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodJourney" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "exposicoes" INTEGER NOT NULL DEFAULT 0,
    "ultimoEstado" "EstadoFeedback",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "diasAcompanhados" INTEGER NOT NULL,
    "receitasDiferentes" INTEGER NOT NULL,
    "alimentosApresentados" INTEGER NOT NULL,
    "alimentosAceitos" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineEntry" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horasSono" DOUBLE PRECISION,
    "qualidadeSono" "QualidadeSono",
    "atividadeMinutos" INTEGER,
    "tipoAtividade" TEXT,
    "disposicao" "NivelDisposicao",
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plano" "PlanoAssinatura" NOT NULL DEFAULT 'ESSENCIAL',
    "status" "StatusAssinatura" NOT NULL DEFAULT 'TESTE',
    "renovaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingCheck" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "semanaInicio" TIMESTAMP(3) NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "comprado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "evento" TEXT NOT NULL,
    "detalhes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_nome_key" ON "Ingredient"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "FoodPreference_childProfileId_ingredientId_status_key" ON "FoodPreference"("childProfileId", "ingredientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "MealSlot_mealPlanId_data_tipo_key" ON "MealSlot"("mealPlanId", "data", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "MealFeedback_mealSlotId_key" ON "MealFeedback"("mealSlotId");

-- CreateIndex
CREATE UNIQUE INDEX "PantryItem_childProfileId_ingredientId_key" ON "PantryItem"("childProfileId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodJourney_childProfileId_ingredientId_key" ON "FoodJourney"("childProfileId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_childProfileId_recipeId_key" ON "Favorite"("childProfileId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineEntry_childProfileId_data_key" ON "RoutineEntry"("childProfileId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingCheck_childProfileId_semanaInicio_ingredientId_key" ON "ShoppingCheck"("childProfileId", "semanaInicio", "ingredientId");

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPreference" ADD CONSTRAINT "FoodPreference_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPreference" ADD CONSTRAINT "FoodPreference_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSlot" ADD CONSTRAINT "MealSlot_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSlot" ADD CONSTRAINT "MealSlot_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFeedback" ADD CONSTRAINT "MealFeedback_mealSlotId_fkey" FOREIGN KEY ("mealSlotId") REFERENCES "MealSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodJourney" ADD CONSTRAINT "FoodJourney_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodJourney" ADD CONSTRAINT "FoodJourney_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineEntry" ADD CONSTRAINT "RoutineEntry_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCheck" ADD CONSTRAINT "ShoppingCheck_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCheck" ADD CONSTRAINT "ShoppingCheck_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
