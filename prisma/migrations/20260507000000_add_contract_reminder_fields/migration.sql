-- Add auto-reminder tracking to Contract
ALTER TABLE "Contract" ADD COLUMN "reminderCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Contract" ADD COLUMN "lastReminderAt" TIMESTAMP(3);
