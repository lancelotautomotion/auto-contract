-- AddColumn: contractTemplateGeneral
ALTER TABLE "Gite" ADD COLUMN "contractTemplateGeneral" TEXT;

-- AddColumn: contractTemplateHouseRules
ALTER TABLE "Gite" ADD COLUMN "contractTemplateHouseRules" TEXT;

-- MigrateData: copy existing contractTemplate → contractTemplateGeneral
UPDATE "Gite" SET "contractTemplateGeneral" = "contractTemplate" WHERE "contractTemplate" IS NOT NULL;

-- DropColumn: contractTemplate (now superseded)
ALTER TABLE "Gite" DROP COLUMN "contractTemplate";
