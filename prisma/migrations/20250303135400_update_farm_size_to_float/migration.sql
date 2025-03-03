-- AlterTable
ALTER TABLE "Farm" ALTER COLUMN "size" TYPE FLOAT USING (size::float); 