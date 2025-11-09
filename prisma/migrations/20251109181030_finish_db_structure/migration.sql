/*
  Warnings:

  - A unique constraint covering the columns `[indicationCode]` on the table `client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('lead', 'client', 'inactive');

-- CreateEnum
CREATE TYPE "IndicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('indication_reward', 'offer_redemption', 'withdrawal');

-- AlterTable
ALTER TABLE "client" ADD COLUMN     "indicationCode" TEXT,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'lead',
ALTER COLUMN "id" SET DEFAULT (concat('client_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "generation_unit" ALTER COLUMN "id" SET DEFAULT (concat('generation_unit_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "inverter" ALTER COLUMN "id" SET DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT;

-- CreateTable
CREATE TABLE "indication" (
    "id" TEXT NOT NULL DEFAULT (concat('indication_', gen_random_uuid()))::TEXT,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "status" "IndicationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL DEFAULT (concat('offer_', gen_random_uuid()))::TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "discount" TEXT,
    "imageUrl" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq" (
    "id" TEXT NOT NULL DEFAULT (concat('faq_', gen_random_uuid()))::TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL DEFAULT (concat('transaction_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "offerId" TEXT,
    "indicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "indication_referrerId_idx" ON "indication"("referrerId");

-- CreateIndex
CREATE INDEX "indication_referredId_idx" ON "indication"("referredId");

-- CreateIndex
CREATE INDEX "transaction_clientId_idx" ON "transaction"("clientId");

-- CreateIndex
CREATE INDEX "transaction_clientId_type_idx" ON "transaction"("clientId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "client_indicationCode_key" ON "client"("indicationCode");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indication" ADD CONSTRAINT "indication_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indication" ADD CONSTRAINT "indication_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
