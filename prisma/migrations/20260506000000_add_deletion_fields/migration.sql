-- Add account auto-deletion tracking fields
ALTER TABLE "User" ADD COLUMN "planExpiredAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletionWarningAt" TIMESTAMP(3);
