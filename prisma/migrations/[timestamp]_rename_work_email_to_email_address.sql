-- Rename workEmail to emailAddress and copy data
ALTER TABLE "Member" ADD COLUMN "emailAddress" TEXT;
UPDATE "Member" SET "emailAddress" = COALESCE("workEmail", email);
ALTER TABLE "Member" ALTER COLUMN "emailAddress" SET NOT NULL;
ALTER TABLE "Member" ADD CONSTRAINT "Member_emailAddress_key" UNIQUE ("emailAddress");
ALTER TABLE "Member" DROP COLUMN "workEmail"; 