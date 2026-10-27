-- Faturapi: conexoes (login compartilhado da distribuidora) ligadas ao cliente
-- e o id da conexao em cada UC monitorada por ela.

ALTER TABLE "public"."consumer_unit" ADD COLUMN "faturapiConnectionId" TEXT;
CREATE INDEX "consumer_unit_faturapiConnectionId_idx" ON "public"."consumer_unit"("faturapiConnectionId");

CREATE TABLE "public"."faturapi_connection" (
    "id" TEXT NOT NULL DEFAULT (concat('faturapi_connection_', gen_random_uuid()))::TEXT,
    "faturapiConnectionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "credentialsHint" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturapi_connection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faturapi_connection_faturapiConnectionId_key" ON "public"."faturapi_connection"("faturapiConnectionId");
CREATE INDEX "faturapi_connection_clientId_idx" ON "public"."faturapi_connection"("clientId");

ALTER TABLE "public"."faturapi_connection" ADD CONSTRAINT "faturapi_connection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
