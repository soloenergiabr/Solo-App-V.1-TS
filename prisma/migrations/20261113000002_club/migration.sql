-- Clube Solo: link e preços das ofertas + regras configuráveis (aditivo, seguro em produção)
ALTER TABLE "offer" ADD COLUMN IF NOT EXISTS "externalUrl" TEXT;
ALTER TABLE "offer" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION;
ALTER TABLE "offer" ADD COLUMN IF NOT EXISTS "promoPrice" DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS "club_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "referralRewardPercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "coinsDescription" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "club_settings_pkey" PRIMARY KEY ("id")
);
