-- CreateTable
CREATE TABLE "IcalFeed" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "blockedDates" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giteId" TEXT NOT NULL,

    CONSTRAINT "IcalFeed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IcalFeed" ADD CONSTRAINT "IcalFeed_giteId_fkey" FOREIGN KEY ("giteId") REFERENCES "Gite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
