-- Catch-up migration: brings `generation_unit` in line with schema.prisma.
--
-- The columns `source`, `providerRecordId`, `rawPayload` and the compound
-- unique constraint exist in schema.prisma but were never captured in a
-- migration file (schema drift). Sprint 4 manual generation upserts on
-- (inverterId, generationUnitType, providerRecordId), so the unique index is
-- required at runtime.
--
-- All statements use IF NOT EXISTS so this is safe to apply whether or not the
-- objects already exist in the target database (e.g. if a prior `db push`
-- already created them). It only ever ADDS — never drops — so it cannot lose data.

-- AlterTable
ALTER TABLE "public"."generation_unit" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "public"."generation_unit" ADD COLUMN IF NOT EXISTS "providerRecordId" TEXT;
ALTER TABLE "public"."generation_unit" ADD COLUMN IF NOT EXISTS "rawPayload" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "generation_unit_providerRecordId_idx" ON "public"."generation_unit"("providerRecordId");

-- CreateIndex (compound unique required by the manual-generation upsert)
-- NULL providerRecordId values are treated as distinct by Postgres, so existing
-- synced rows without a providerRecordId do not conflict.
CREATE UNIQUE INDEX IF NOT EXISTS "generation_unit_inverterId_generationUnitType_providerRecordId_key" ON "public"."generation_unit"("inverterId", "generationUnitType", "providerRecordId");
