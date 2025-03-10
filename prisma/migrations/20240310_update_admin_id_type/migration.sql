-- First check if Admin table exists
DO $$ 
BEGIN
    -- If Admin table exists, modify it
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Admin') THEN
        -- Only modify if id is not TEXT
        IF EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'Admin' 
                  AND column_name = 'id' 
                  AND data_type != 'text') THEN
            -- Safe conversion of existing id
            ALTER TABLE "Admin" ADD COLUMN "new_id" TEXT;
            UPDATE "Admin" SET "new_id" = id::text;
            ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey";
            ALTER TABLE "Admin" DROP COLUMN "id";
            ALTER TABLE "Admin" RENAME COLUMN "new_id" TO "id";
            ALTER TABLE "Admin" ADD PRIMARY KEY ("id");
        END IF;
    ELSE
        -- Create new table if it doesn't exist
        CREATE TABLE "Admin" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'admin',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Ensure email index exists
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email"); 