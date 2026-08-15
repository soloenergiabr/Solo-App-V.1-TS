-- Geracao distribuida: regra de cobranca por UC, cobranca por competencia
-- e convite de usuario pagador.
-- O titular recebe todas as faturas, rateia a energia (credit_allocation, ja existente)
-- e agora tambem define QUEM paga e QUANTO paga por unidade consumidora.

-- CreateEnum
CREATE TYPE "public"."ChargeMode" AS ENUM ('pass_through', 'per_kwh', 'fixed');

-- CreateEnum
CREATE TYPE "public"."ChargeStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'canceled');

-- CreateEnum
CREATE TYPE "public"."PayerInviteStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- CreateTable
CREATE TABLE "public"."charge_rule" (
    "id" TEXT NOT NULL DEFAULT (concat('charge_rule_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "consumerUnitId" TEXT NOT NULL,
    "mode" "public"."ChargeMode" NOT NULL DEFAULT 'pass_through',
    "pricePerKwh" DECIMAL(12,6),
    "fixedAmount" DECIMAL(14,2),
    "dueDayOfMonth" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "charge_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."charge" (
    "id" TEXT NOT NULL DEFAULT (concat('charge_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "consumerUnitId" TEXT NOT NULL,
    "energyBillId" TEXT,
    "chargeRuleId" TEXT,
    "referenceMonth" INTEGER NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "mode" "public"."ChargeMode" NOT NULL,
    "basisKwh" DECIMAL(14,4),
    "pricePerKwh" DECIMAL(12,6),
    "amount" DECIMAL(14,2) NOT NULL,
    "dueDate" DATE,
    "status" "public"."ChargeStatus" NOT NULL DEFAULT 'draft',
    "payerUserId" TEXT,
    "payerName" TEXT,
    "payerEmail" TEXT,
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "confirmedByUserId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payer_invite" (
    "id" TEXT NOT NULL DEFAULT (concat('payer_invite_', gen_random_uuid()))::TEXT,
    "clientId" TEXT NOT NULL,
    "consumerUnitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."PayerInviteStatus" NOT NULL DEFAULT 'pending',
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "invitedByUserId" TEXT,
    "acceptedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payer_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charge_rule_consumerUnitId_key" ON "public"."charge_rule"("consumerUnitId");

-- CreateIndex
CREATE INDEX "charge_rule_clientId_idx" ON "public"."charge_rule"("clientId");

-- CreateIndex
CREATE INDEX "charge_rule_clientId_isActive_idx" ON "public"."charge_rule"("clientId", "isActive");

-- CreateIndex
CREATE INDEX "charge_clientId_idx" ON "public"."charge"("clientId");

-- CreateIndex
CREATE INDEX "charge_clientId_status_idx" ON "public"."charge"("clientId", "status");

-- CreateIndex
CREATE INDEX "charge_consumerUnitId_idx" ON "public"."charge"("consumerUnitId");

-- CreateIndex
CREATE INDEX "charge_payerUserId_idx" ON "public"."charge"("payerUserId");

-- CreateIndex
CREATE INDEX "charge_referenceYear_referenceMonth_idx" ON "public"."charge"("referenceYear", "referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "charge_consumerUnitId_referenceYear_referenceMonth_key" ON "public"."charge"("consumerUnitId", "referenceYear", "referenceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "payer_invite_tokenHash_key" ON "public"."payer_invite"("tokenHash");

-- CreateIndex
CREATE INDEX "payer_invite_clientId_idx" ON "public"."payer_invite"("clientId");

-- CreateIndex
CREATE INDEX "payer_invite_consumerUnitId_idx" ON "public"."payer_invite"("consumerUnitId");

-- CreateIndex
CREATE INDEX "payer_invite_email_idx" ON "public"."payer_invite"("email");

-- CreateIndex
CREATE INDEX "payer_invite_status_idx" ON "public"."payer_invite"("status");

-- AddForeignKey
ALTER TABLE "public"."charge_rule" ADD CONSTRAINT "charge_rule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charge_rule" ADD CONSTRAINT "charge_rule_consumerUnitId_fkey" FOREIGN KEY ("consumerUnitId") REFERENCES "public"."consumer_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charge" ADD CONSTRAINT "charge_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charge" ADD CONSTRAINT "charge_consumerUnitId_fkey" FOREIGN KEY ("consumerUnitId") REFERENCES "public"."consumer_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charge" ADD CONSTRAINT "charge_energyBillId_fkey" FOREIGN KEY ("energyBillId") REFERENCES "public"."energy_bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charge" ADD CONSTRAINT "charge_chargeRuleId_fkey" FOREIGN KEY ("chargeRuleId") REFERENCES "public"."charge_rule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charge" ADD CONSTRAINT "charge_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payer_invite" ADD CONSTRAINT "payer_invite_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payer_invite" ADD CONSTRAINT "payer_invite_consumerUnitId_fkey" FOREIGN KEY ("consumerUnitId") REFERENCES "public"."consumer_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
