-- CreateEnum
CREATE TYPE "MealService" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'OTHER');

-- AlterTable
ALTER TABLE "ReservationMeal" ADD COLUMN "service" "MealService" NOT NULL DEFAULT 'DINNER',
ADD COLUMN "guesthouseMealId" TEXT;

-- CreateTable
CREATE TABLE "GuesthouseMeal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "service" "MealService" NOT NULL DEFAULT 'DINNER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guesthouseId" TEXT NOT NULL,

    CONSTRAINT "GuesthouseMeal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuesthouseMeal" ADD CONSTRAINT "GuesthouseMeal_guesthouseId_fkey" FOREIGN KEY ("guesthouseId") REFERENCES "Guesthouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationMeal" ADD CONSTRAINT "ReservationMeal_guesthouseMealId_fkey" FOREIGN KEY ("guesthouseMealId") REFERENCES "GuesthouseMeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
