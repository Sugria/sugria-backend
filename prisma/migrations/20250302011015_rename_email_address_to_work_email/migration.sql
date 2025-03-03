/*
  Warnings:

  - You are about to drop the column `emailAddress` on the `Member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workEmail]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workEmail` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Member_emailAddress_key";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "emailAddress",
ADD COLUMN     "workEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_workEmail_key" ON "Member"("workEmail");
