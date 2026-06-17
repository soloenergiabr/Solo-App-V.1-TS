-- CreateEnum
CREATE TYPE "public"."BillPaymentStatus" AS ENUM ('a_pagar', 'paga', 'vencida');

-- AlterTable
ALTER TABLE "public"."consumer_unit" ADD COLUMN     "payerEmail" TEXT,
ADD COLUMN     "payerName" TEXT,
ADD COLUMN     "payerPhone" TEXT,
ADD COLUMN     "payerUserId" TEXT;

-- AlterTable
ALTER TABLE "public"."energy_bill" ADD COLUMN     "amountDue" DECIMAL(14,2),
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "dueDate" DATE,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "public"."BillPaymentStatus" NOT NULL DEFAULT 'a_pagar',
ADD COLUMN     "pixCode" TEXT;

-- CreateTable
CREATE TABLE "public"."investment" (
    "id" TEXT NOT NULL DEFAULT (concat('investment_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "totalInvested" DECIMAL(14,2) NOT NULL,
    "startDate" DATE NOT NULL,
    "expectedPayoff" DATE,
    "monthlyReturn" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investment_clientId_idx" ON "public"."investment"("clientId");

-- CreateIndex
CREATE INDEX "consumer_unit_payerUserId_idx" ON "public"."consumer_unit"("payerUserId");

-- CreateIndex
CREATE INDEX "energy_bill_clientId_paymentStatus_idx" ON "public"."energy_bill"("clientId", "paymentStatus");

-- AddForeignKey
ALTER TABLE "public"."consumer_unit" ADD CONSTRAINT "consumer_unit_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."investment" ADD CONSTRAINT "investment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
