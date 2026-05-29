-- CreateTable
CREATE TABLE "GuesthouseDocument" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guesthouseId" TEXT NOT NULL,

    CONSTRAINT "GuesthouseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuesthouseIcalFeed" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3),
    "blockedDates" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "GuesthouseIcalFeed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuesthouseDocument" ADD CONSTRAINT "GuesthouseDocument_guesthouseId_fkey" FOREIGN KEY ("guesthouseId") REFERENCES "Guesthouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuesthouseIcalFeed" ADD CONSTRAINT "GuesthouseIcalFeed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
