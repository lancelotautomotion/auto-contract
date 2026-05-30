-- AlterTable
ALTER TABLE "Guesthouse" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Guesthouse_slug_key" ON "Guesthouse"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Room_guesthouseId_slug_key" ON "Room"("guesthouseId", "slug");
