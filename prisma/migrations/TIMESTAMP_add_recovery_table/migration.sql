-- CreateTable
CREATE TABLE "Recovery" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recovery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recovery_email_key" ON "Recovery"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Recovery_token_key" ON "Recovery"("token");

-- CreateIndex
CREATE INDEX "Recovery_email_idx" ON "Recovery"("email");

-- CreateIndex
CREATE INDEX "Recovery_token_idx" ON "Recovery"("token"); 