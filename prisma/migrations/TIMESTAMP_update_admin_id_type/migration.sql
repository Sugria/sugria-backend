-- First create a temporary column
ALTER TABLE "Admin" ADD COLUMN "new_id" TEXT;

-- Update the temporary column with CUID values
UPDATE "Admin" SET "new_id" = gen_random_uuid()::text;

-- Drop the primary key constraint
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey";

-- Drop the old id column
ALTER TABLE "Admin" DROP COLUMN "id";

-- Rename new_id to id
ALTER TABLE "Admin" RENAME COLUMN "new_id" TO "id";

-- Make id the primary key
ALTER TABLE "Admin" ADD PRIMARY KEY ("id");

-- Set the default for new records
ALTER TABLE "Admin" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text; 