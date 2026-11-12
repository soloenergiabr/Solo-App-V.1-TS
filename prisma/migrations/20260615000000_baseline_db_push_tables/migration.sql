-- Baseline das tabelas que entraram no banco via `prisma db push` e nunca ganharam
-- migration (plant, consumer_unit, credit_allocation, offer_redemption, energy_bill e
-- ajustes de tipos/colunas). Sem isto, `prisma migrate deploy` falha num banco novo.
--
-- Em bancos que ja tem essas tabelas (producao) o bloco inteiro e pulado: nada e
-- alterado. So roda num banco criado do zero pelas migrations.
DO $baseline$
BEGIN
IF to_regclass('public.consumer_unit') IS NULL THEN
-- CreateEnum
CREATE TYPE "public"."GenerationUnitType" AS ENUM ('real_time', 'day', 'month', 'year');

-- CreateEnum
CREATE TYPE "public"."RedemptionStatus" AS ENUM ('pending', 'used', 'expired');

-- AlterTable
ALTER TABLE "public"."client" ALTER COLUMN "id" SET DEFAULT (concat('client_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."consumption" ALTER COLUMN "id" SET DEFAULT (concat('consumption_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."faq" ALTER COLUMN "id" SET DEFAULT (concat('faq_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."generation_unit" ADD COLUMN     "providerRecordId" TEXT,
ADD COLUMN     "rawPayload" JSONB,
ADD COLUMN     "source" TEXT,
ALTER COLUMN "id" SET DEFAULT (concat('generation_unit_', gen_random_uuid()))::TEXT,
DROP COLUMN "generationUnitType",
ADD COLUMN     "generationUnitType" "public"."GenerationUnitType" NOT NULL DEFAULT 'real_time';

-- AlterTable
ALTER TABLE "public"."indication" ALTER COLUMN "id" SET DEFAULT (concat('indication_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."inverter" ADD COLUMN     "commissionedAt" TIMESTAMP(3),
ADD COLUMN     "firmwareVersion" TEXT,
ADD COLUMN     "installedAt" TIMESTAMP(3),
ADD COLUMN     "lastSuccessfulSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncError" TEXT,
ADD COLUMN     "lastSyncStatus" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "modelName" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "nominalPowerKw" DECIMAL(10,3),
ADD COLUMN     "plantId" TEXT,
ADD COLUMN     "providerConfig" JSONB,
ADD COLUMN     "providerMetadata" JSONB,
ADD COLUMN     "providerPlantId" TEXT,
ADD COLUMN     "providerPlantName" TEXT,
ADD COLUMN     "providerStatus" TEXT,
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "syncIntervalMinutes" INTEGER,
ADD COLUMN     "timezone" TEXT,
ALTER COLUMN "id" SET DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."offer" ADD COLUMN     "confirmationCode" TEXT,
ADD COLUMN     "maxRedemptionsPerClient" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "id" SET DEFAULT (concat('offer_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."transaction" ALTER COLUMN "id" SET DEFAULT (concat('transaction_', gen_random_uuid()))::TEXT;

-- CreateTable
CREATE TABLE "public"."plant" (
    "id" TEXT NOT NULL DEFAULT (concat('plant_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "name" TEXT,
    "provider" TEXT,
    "providerStatus" TEXT,
    "providerPlantId" TEXT,
    "installedPowerKw" DECIMAL(10,3),
    "totalEnergyKwh" DECIMAL(14,4),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "timezone" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "providerMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consumer_unit" (
    "id" TEXT NOT NULL DEFAULT (concat('consumer_unit_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "name" TEXT,
    "isGenerator" BOOLEAN NOT NULL DEFAULT true,
    "isConsumer" BOOLEAN NOT NULL DEFAULT true,
    "accountHolder" TEXT,
    "accountNumber" TEXT,
    "clientNumber" TEXT,
    "installationNumber" TEXT,
    "distributor" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "status" TEXT,
    "plantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "consumer_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credit_allocation" (
    "id" TEXT NOT NULL DEFAULT (concat('credit_allocation_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "allocationPercentage" DECIMAL(5,2) NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "credit_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."offer_redemption" (
    "id" TEXT NOT NULL DEFAULT (concat('redemption_', gen_random_uuid()))::TEXT,
    "redemptionCode" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "public"."RedemptionStatus" NOT NULL DEFAULT 'pending',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."energy_bill" (
    "id" TEXT NOT NULL DEFAULT (concat('energy_bill_', gen_random_uuid()))::TEXT,
    "billFileUrl" TEXT,
    "rawBillFileKey" TEXT,
    "rawBillFileSize" INTEGER,
    "clientId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "consumerUnitId" TEXT NOT NULL,
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "referenceMonth" INTEGER NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "accountHolder" TEXT,
    "accountNumber" TEXT,
    "clientNumber" TEXT,
    "instalationNumber" TEXT,
    "distributor" TEXT,
    "consumerClass" TEXT,
    "tariffModality" TEXT,
    "connectionType" TEXT,
    "tariffPeriod" TEXT,
    "billingDays" INTEGER,
    "readingPeriodFrom" DATE,
    "readingPeriodTo" DATE,
    "creditExpiryDate" DATE,
    "monitoredGenerationKwh" DECIMAL(14,4),
    "billedConsumptionKwh" DECIMAL(14,4),
    "consumptionKwh" DECIMAL(14,4),
    "realConsumptionKwh" DECIMAL(14,4),
    "injectedEnergyKwh" DECIMAL(14,4),
    "compensatedEnergyKwh" DECIMAL(14,4),
    "previousCreditsKwh" DECIMAL(14,4),
    "currentCreditsKwh" DECIMAL(14,4),
    "expectedGenerationKwh" DECIMAL(14,4),
    "generationEfficiency" DECIMAL(8,4),
    "meterReadingCurrent" DECIMAL(14,4),
    "meterReadingPrevious" DECIMAL(14,4),
    "demandContractedKw" DECIMAL(14,4),
    "demandMeasuredKw" DECIMAL(14,4),
    "totalBillValue" DECIMAL(14,2),
    "totalAmount" DECIMAL(14,2),
    "energyCost" DECIMAL(14,2),
    "availabilityCost" DECIMAL(14,2),
    "publicLightingCost" DECIMAL(14,2),
    "icmsCost" DECIMAL(14,2),
    "pisCost" DECIMAL(14,2),
    "cofinsCost" DECIMAL(14,2),
    "pisCofinsCost" DECIMAL(14,2),
    "tariffPerKwh" DECIMAL(12,6),
    "tariffTeValue" DECIMAL(12,6),
    "tariffTusdValue" DECIMAL(12,6),
    "tariffFlag" TEXT,
    "tariffFlagCost" DECIMAL(14,2),
    "sectoralCharges" DECIMAL(14,2),
    "fineAmount" DECIMAL(14,2),
    "interestAmount" DECIMAL(14,2),
    "otherCharges" DECIMAL(14,2),
    "estimatedSavings" DECIMAL(14,2),
    "aiAnalysis" TEXT,
    "aiExplanations" JSONB,
    "aiRecommendations" JSONB,
    "alerts" JSONB,
    "extraCharges" JSONB,
    "billingItems" JSONB,
    "creditSummary" JSONB,
    "billScore" DECIMAL(5,2),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plant_clientId_idx" ON "public"."plant"("clientId");

-- CreateIndex
CREATE INDEX "plant_providerPlantId_idx" ON "public"."plant"("providerPlantId");

-- CreateIndex
CREATE INDEX "consumer_unit_clientId_idx" ON "public"."consumer_unit"("clientId");

-- CreateIndex
CREATE INDEX "consumer_unit_plantId_idx" ON "public"."consumer_unit"("plantId");

-- CreateIndex
CREATE INDEX "consumer_unit_clientId_plantId_idx" ON "public"."consumer_unit"("clientId", "plantId");

-- CreateIndex
CREATE INDEX "consumer_unit_clientId_clientNumber_idx" ON "public"."consumer_unit"("clientId", "clientNumber");

-- CreateIndex
CREATE INDEX "credit_allocation_clientId_idx" ON "public"."credit_allocation"("clientId");

-- CreateIndex
CREATE INDEX "credit_allocation_plantId_idx" ON "public"."credit_allocation"("plantId");

-- CreateIndex
CREATE INDEX "credit_allocation_fromId_idx" ON "public"."credit_allocation"("fromId");

-- CreateIndex
CREATE INDEX "credit_allocation_toId_idx" ON "public"."credit_allocation"("toId");

-- CreateIndex
CREATE INDEX "credit_allocation_clientId_plantId_idx" ON "public"."credit_allocation"("clientId", "plantId");

-- CreateIndex
CREATE INDEX "credit_allocation_clientId_isActive_idx" ON "public"."credit_allocation"("clientId", "isActive");

-- CreateIndex
CREATE INDEX "credit_allocation_fromId_toId_idx" ON "public"."credit_allocation"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_redemption_redemptionCode_key" ON "public"."offer_redemption"("redemptionCode");

-- CreateIndex
CREATE INDEX "offer_redemption_clientId_idx" ON "public"."offer_redemption"("clientId");

-- CreateIndex
CREATE INDEX "offer_redemption_offerId_idx" ON "public"."offer_redemption"("offerId");

-- CreateIndex
CREATE INDEX "offer_redemption_clientId_status_idx" ON "public"."offer_redemption"("clientId", "status");

-- CreateIndex
CREATE INDEX "offer_redemption_redemptionCode_idx" ON "public"."offer_redemption"("redemptionCode");

-- CreateIndex
CREATE INDEX "energy_bill_clientId_idx" ON "public"."energy_bill"("clientId");

-- CreateIndex
CREATE INDEX "energy_bill_plantId_idx" ON "public"."energy_bill"("plantId");

-- CreateIndex
CREATE INDEX "energy_bill_consumerUnitId_idx" ON "public"."energy_bill"("consumerUnitId");

-- CreateIndex
CREATE INDEX "energy_bill_referenceYear_referenceMonth_idx" ON "public"."energy_bill"("referenceYear", "referenceMonth");

-- CreateIndex
CREATE INDEX "energy_bill_clientId_referenceYear_referenceMonth_idx" ON "public"."energy_bill"("clientId", "referenceYear", "referenceMonth");

-- CreateIndex
CREATE INDEX "energy_bill_status_idx" ON "public"."energy_bill"("status");

-- CreateIndex
CREATE UNIQUE INDEX "energy_bill_consumerUnitId_referenceMonth_referenceYear_key" ON "public"."energy_bill"("consumerUnitId", "referenceMonth", "referenceYear");

-- CreateIndex
CREATE INDEX "generation_unit_inverterId_generationUnitType_idx" ON "public"."generation_unit"("inverterId", "generationUnitType");

-- CreateIndex
CREATE INDEX "generation_unit_inverterId_generationUnitType_timestamp_idx" ON "public"."generation_unit"("inverterId", "generationUnitType", "timestamp");

-- CreateIndex
CREATE INDEX "generation_unit_providerRecordId_idx" ON "public"."generation_unit"("providerRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "generation_unit_inverterId_generationUnitType_providerRecor_key" ON "public"."generation_unit"("inverterId", "generationUnitType", "providerRecordId");

-- CreateIndex
CREATE INDEX "inverter_clientId_idx" ON "public"."inverter"("clientId");

-- CreateIndex
CREATE INDEX "inverter_plantId_idx" ON "public"."inverter"("plantId");

-- CreateIndex
CREATE INDEX "inverter_provider_providerId_idx" ON "public"."inverter"("provider", "providerId");

-- CreateIndex
CREATE INDEX "inverter_providerPlantId_idx" ON "public"."inverter"("providerPlantId");

-- CreateIndex
CREATE INDEX "inverter_syncEnabled_idx" ON "public"."inverter"("syncEnabled");

-- CreateIndex
CREATE INDEX "inverter_lastSyncStatus_idx" ON "public"."inverter"("lastSyncStatus");

-- AddForeignKey
ALTER TABLE "public"."plant" ADD CONSTRAINT "plant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inverter" ADD CONSTRAINT "inverter_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "public"."plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consumer_unit" ADD CONSTRAINT "consumer_unit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consumer_unit" ADD CONSTRAINT "consumer_unit_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "public"."plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_allocation" ADD CONSTRAINT "credit_allocation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_allocation" ADD CONSTRAINT "credit_allocation_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "public"."plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_allocation" ADD CONSTRAINT "credit_allocation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."consumer_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_allocation" ADD CONSTRAINT "credit_allocation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."consumer_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offer_redemption" ADD CONSTRAINT "offer_redemption_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offer_redemption" ADD CONSTRAINT "offer_redemption_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."energy_bill" ADD CONSTRAINT "energy_bill_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."energy_bill" ADD CONSTRAINT "energy_bill_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "public"."plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."energy_bill" ADD CONSTRAINT "energy_bill_consumerUnitId_fkey" FOREIGN KEY ("consumerUnitId") REFERENCES "public"."consumer_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;


END IF;
END
$baseline$;
