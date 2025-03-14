-- DropForeignKey
ALTER TABLE "EmailTracking" DROP CONSTRAINT "EmailTracking_emailTemplateId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EmailTracking" ALTER COLUMN "emailTemplateId" DROP NOT NULL;
