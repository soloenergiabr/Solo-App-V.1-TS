-- DropForeignKey
ALTER TABLE "public"."generation_unit" DROP CONSTRAINT "generation_unit_inverterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."indication" DROP CONSTRAINT "indication_referredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."indication" DROP CONSTRAINT "indication_referrerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inverter" DROP CONSTRAINT "inverter_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaction" DROP CONSTRAINT "transaction_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_clientId_fkey";

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

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inverter" ADD CONSTRAINT "inverter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generation_unit" ADD CONSTRAINT "generation_unit_inverterId_fkey" FOREIGN KEY ("inverterId") REFERENCES "public"."inverter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."indication" ADD CONSTRAINT "indication_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."indication" ADD CONSTRAINT "indication_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
