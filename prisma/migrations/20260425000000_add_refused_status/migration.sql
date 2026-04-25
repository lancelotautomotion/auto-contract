-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'REFUSED';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "refusalNote" TEXT;
ALTER TABLE "Reservation" ADD COLUMN "refusalReason" TEXT;
