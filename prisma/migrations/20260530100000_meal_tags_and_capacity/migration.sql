-- AlterTable
ALTER TABLE "GuesthouseMeal" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Guesthouse" ADD COLUMN "tableDhotesCapacity" INTEGER NOT NULL DEFAULT 0;
