-- Rename trial email sent flags: J-7→J-15 and J-3→J-5
ALTER TABLE "User" RENAME COLUMN "trialEmailSent7" TO "trialEmailSent15";
ALTER TABLE "User" RENAME COLUMN "trialEmailSent3" TO "trialEmailSent5";
