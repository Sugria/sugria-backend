-- First update any null emailAddress with workEmail
UPDATE "Member"
SET "emailAddress" = "workEmail"
WHERE "emailAddress" IS NULL;

-- Then drop the workEmail column
ALTER TABLE "Member"
DROP COLUMN "workEmail"; 