-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING_REVIEW', 'NEW', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING', 'GENERATING', 'GENERATED', 'SIGNED', 'ERROR');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('NOT_SENT', 'SENDING', 'SENT', 'ERROR');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planStatus" "PlanStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "trialEmailSent7" BOOLEAN NOT NULL DEFAULT false,
    "trialEmailSent3" BOOLEAN NOT NULL DEFAULT false,
    "trialEmailSent1" BOOLEAN NOT NULL DEFAULT false,
    "trialEmailSent0" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 12,
    "cleaningFee" DOUBLE PRECISION NOT NULL DEFAULT 90,
    "touristTax" DOUBLE PRECISION NOT NULL DEFAULT 1.32,
    "slug" TEXT,
    "contractTemplate" TEXT,
    "logoUrl" TEXT,
    "notificationEmail" TEXT,
    "driveTemplateFolderId" TEXT,
    "driveOutputFolderId" TEXT,
    "n8nWebhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Gite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiteOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "giteId" TEXT NOT NULL,

    CONSTRAINT "GiteOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientFirstName" TEXT NOT NULL,
    "clientLastName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientAddress" TEXT,
    "clientCity" TEXT,
    "clientZipCode" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "rent" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "cleaningFee" DOUBLE PRECISION,
    "touristTax" DOUBLE PRECISION,
    "notes" TEXT,
    "giteId" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservationId" TEXT NOT NULL,
    "giteOptionId" TEXT,

    CONSTRAINT "ReservationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "driveFileId" TEXT,
    "driveFileUrl" TEXT,
    "signatureToken" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedByName" TEXT,
    "signedByIp" TEXT,
    "depositReceived" BOOLEAN NOT NULL DEFAULT false,
    "depositReceivedAt" TIMESTAMP(3),
    "signedPdfUrl" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "emailStatus" "EmailStatus" NOT NULL DEFAULT 'NOT_SENT',
    "reservationId" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiteDocument" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giteId" TEXT NOT NULL,

    CONSTRAINT "GiteDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Gite_slug_key" ON "Gite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_signatureToken_key" ON "Contract"("signatureToken");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_reservationId_key" ON "Contract"("reservationId");

-- AddForeignKey
ALTER TABLE "Gite" ADD CONSTRAINT "Gite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiteOption" ADD CONSTRAINT "GiteOption_giteId_fkey" FOREIGN KEY ("giteId") REFERENCES "Gite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_giteId_fkey" FOREIGN KEY ("giteId") REFERENCES "Gite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationOption" ADD CONSTRAINT "ReservationOption_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationOption" ADD CONSTRAINT "ReservationOption_giteOptionId_fkey" FOREIGN KEY ("giteOptionId") REFERENCES "GiteOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiteDocument" ADD CONSTRAINT "GiteDocument_giteId_fkey" FOREIGN KEY ("giteId") REFERENCES "Gite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

