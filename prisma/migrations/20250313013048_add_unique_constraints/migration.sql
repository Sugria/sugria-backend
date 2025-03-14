/*
  Warnings:

  - A unique constraint covering the columns `[recipientEmail,resendId]` on the table `EmailTracking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[firstName,lastName,email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "EmailTracking_recipientEmail_resendId_key" ON "EmailTracking"("recipientEmail", "resendId");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_workEmail_idx" ON "Member"("workEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Member_firstName_lastName_email_key" ON "Member"("firstName", "lastName", "email");
