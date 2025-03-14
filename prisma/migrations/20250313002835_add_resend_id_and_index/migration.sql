-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EmailTracking" ADD COLUMN     "resendId" TEXT;

-- CreateIndex
CREATE INDEX "EmailTracking_recipientEmail_idx" ON "EmailTracking"("recipientEmail");
