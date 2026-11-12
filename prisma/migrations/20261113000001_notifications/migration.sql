-- Notificacoes inteligentes (contrato 2.5). Aditiva: so cria tabela e indices.
CREATE TABLE IF NOT EXISTS "notification" (
    "id" TEXT NOT NULL DEFAULT (concat('notification_', gen_random_uuid()))::TEXT,
    "clientId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_dedupeKey_key" ON "notification"("dedupeKey");
CREATE INDEX IF NOT EXISTS "notification_clientId_createdAt_idx" ON "notification"("clientId", "createdAt");

DO $$ BEGIN
    ALTER TABLE "notification" ADD CONSTRAINT "notification_clientId_fkey"
        FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
