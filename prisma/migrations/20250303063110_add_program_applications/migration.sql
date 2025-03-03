-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programId" INTEGER NOT NULL,
    "personalId" INTEGER NOT NULL,
    "farmId" INTEGER NOT NULL,
    "grantId" INTEGER NOT NULL,
    "trainingId" INTEGER NOT NULL,
    "motivationId" INTEGER NOT NULL,
    "declarationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "previousTraining" BOOLEAN NOT NULL,
    "trainingId" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "practices" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" SERIAL NOT NULL,
    "outcomes" TEXT NOT NULL,
    "budgetFile" TEXT NOT NULL,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" SERIAL NOT NULL,
    "preference" TEXT NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motivation" (
    "id" SERIAL NOT NULL,
    "statement" TEXT NOT NULL,
    "implementation" TEXT NOT NULL,
    "identityFile" TEXT NOT NULL,

    CONSTRAINT "Motivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Declaration" (
    "id" SERIAL NOT NULL,
    "agreed" BOOLEAN NOT NULL,
    "officerName" TEXT NOT NULL,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationId_key" ON "Application"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_programId_key" ON "Application"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_personalId_key" ON "Application"("personalId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_farmId_key" ON "Application"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_grantId_key" ON "Application"("grantId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_trainingId_key" ON "Application"("trainingId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_motivationId_key" ON "Application"("motivationId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_declarationId_key" ON "Application"("declarationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_motivationId_fkey" FOREIGN KEY ("motivationId") REFERENCES "Motivation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "Declaration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
