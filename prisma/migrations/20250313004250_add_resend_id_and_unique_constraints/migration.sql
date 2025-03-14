/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resendId]` on the table `EmailTracking` will be added. If there are existing duplicate values, this will fail.
  - Made the column `resendId` on table `EmailTracking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EmailTracking" ALTER COLUMN "resendId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTracking_resendId_key" ON "EmailTracking"("resendId");
