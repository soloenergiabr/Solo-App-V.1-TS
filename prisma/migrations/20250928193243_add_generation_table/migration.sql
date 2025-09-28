/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inverter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Inverter" DROP CONSTRAINT "Inverter_clientId_fkey";

-- DropTable
DROP TABLE "public"."Client";

-- DropTable
DROP TABLE "public"."Inverter";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client" (
    "id" TEXT NOT NULL DEFAULT (concat('client_', gen_random_uuid()))::TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "soloCoinBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inverter" (
    "id" TEXT NOT NULL DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerApiKey" TEXT,
    "providerApiSecret" TEXT,
    "providerUrl" TEXT,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "inverter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generation_unit" (
    "id" TEXT NOT NULL DEFAULT (concat('generation_unit_', gen_random_uuid()))::TEXT,
    "power" DOUBLE PRECISION NOT NULL,
    "energy" DOUBLE PRECISION NOT NULL,
    "generationUnitType" TEXT NOT NULL DEFAULT 'real_time',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inverterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "generation_unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "public"."client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_cpfCnpj_key" ON "public"."client"("cpfCnpj");

-- CreateIndex
CREATE INDEX "client_email_idx" ON "public"."client"("email");

-- CreateIndex
CREATE INDEX "client_cpfCnpj_idx" ON "public"."client"("cpfCnpj");

-- CreateIndex
CREATE INDEX "inverter_providerId_idx" ON "public"."inverter"("providerId");

-- CreateIndex
CREATE INDEX "generation_unit_inverterId_idx" ON "public"."generation_unit"("inverterId");

-- CreateIndex
CREATE INDEX "generation_unit_inverterId_generationUnitType_idx" ON "public"."generation_unit"("inverterId", "generationUnitType");

-- CreateIndex
CREATE INDEX "generation_unit_inverterId_generationUnitType_timestamp_idx" ON "public"."generation_unit"("inverterId", "generationUnitType", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."inverter" ADD CONSTRAINT "inverter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generation_unit" ADD CONSTRAINT "generation_unit_inverterId_fkey" FOREIGN KEY ("inverterId") REFERENCES "public"."inverter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
