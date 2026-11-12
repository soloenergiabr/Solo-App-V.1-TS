-- Pagamento online das cobrancas de GD (Stripe Checkout). Aditiva: so colunas nulas.
ALTER TABLE "charge" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
ALTER TABLE "charge" ADD COLUMN IF NOT EXISTS "paymentSessionId" TEXT;
ALTER TABLE "charge" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "charge_paymentSessionId_key" ON "charge"("paymentSessionId");
