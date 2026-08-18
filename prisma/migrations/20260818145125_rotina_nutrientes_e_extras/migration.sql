-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "magnesioMg" DOUBLE PRECISION,
ADD COLUMN     "niacinaMg" DOUBLE PRECISION,
ADD COLUMN     "piridoxinaMg" DOUBLE PRECISION,
ADD COLUMN     "potassioMg" DOUBLE PRECISION,
ADD COLUMN     "riboflavinaMg" DOUBLE PRECISION,
ADD COLUMN     "tiaminaMg" DOUBLE PRECISION,
ADD COLUMN     "triptofanoG" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "scoreCalma" DOUBLE PRECISION,
ADD COLUMN     "scoreEnergia" DOUBLE PRECISION,
ADD COLUMN     "scoreSono" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ShoppingExtra" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "semanaInicio" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'OUTROS',
    "comprado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingExtra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShoppingExtra_childProfileId_semanaInicio_idx" ON "ShoppingExtra"("childProfileId", "semanaInicio");

-- AddForeignKey
ALTER TABLE "ShoppingExtra" ADD CONSTRAINT "ShoppingExtra_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
