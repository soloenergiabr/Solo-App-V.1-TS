-- Faturapi: vinculo da UC com a unidade monitorada, dados da fatura vinda
-- da API e tabela de deduplicacao dos webhooks.

ALTER TABLE "public"."consumer_unit" ADD COLUMN "faturapiUnitId" TEXT;
ALTER TABLE "public"."consumer_unit" ADD COLUMN "faturapiStatus" TEXT;
CREATE UNIQUE INDEX "consumer_unit_faturapiUnitId_key" ON "public"."consumer_unit"("faturapiUnitId");

ALTER TABLE "public"."energy_bill" ADD COLUMN "faturapiInvoiceId" TEXT;
ALTER TABLE "public"."energy_bill" ADD COLUMN "faturapiParsed" JSONB;
CREATE UNIQUE INDEX "energy_bill_faturapiInvoiceId_key" ON "public"."energy_bill"("faturapiInvoiceId");

CREATE TABLE "public"."faturapi_webhook_event" (
    "id" TEXT NOT NULL DEFAULT (concat('faturapi_event_', gen_random_uuid()))::TEXT,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faturapi_webhook_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faturapi_webhook_event_eventId_key" ON "public"."faturapi_webhook_event"("eventId");
CREATE INDEX "faturapi_webhook_event_status_idx" ON "public"."faturapi_webhook_event"("status");
