-- AlterTable
ALTER TABLE "public"."client" ALTER COLUMN "id" SET DEFAULT (concat('client_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."faq" ALTER COLUMN "id" SET DEFAULT (concat('faq_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."generation_unit" ALTER COLUMN "id" SET DEFAULT (concat('generation_unit_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."indication" ALTER COLUMN "id" SET DEFAULT (concat('indication_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."inverter" ALTER COLUMN "id" SET DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."offer" ALTER COLUMN "id" SET DEFAULT (concat('offer_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."transaction" ALTER COLUMN "id" SET DEFAULT (concat('transaction_', gen_random_uuid()))::TEXT;

-- CreateTable
CREATE TABLE "public"."consumption" (
    "id" TEXT NOT NULL DEFAULT (concat('consumption_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "consumptionKwh" DOUBLE PRECISION NOT NULL,
    "injectedEnergyKwh" DOUBLE PRECISION NOT NULL,
    "tariffPerKwh" DOUBLE PRECISION NOT NULL,
    "totalBillValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consumption_clientId_idx" ON "public"."consumption"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "consumption_clientId_competenceDate_key" ON "public"."consumption"("clientId", "competenceDate");

-- AddForeignKey
ALTER TABLE "public"."consumption" ADD CONSTRAINT "consumption_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
