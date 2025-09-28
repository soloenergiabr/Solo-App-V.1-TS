-- AlterTable
ALTER TABLE "public"."Client" ALTER COLUMN "id" SET DEFAULT (concat('client_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."Inverter" ADD COLUMN     "providerApiKey" TEXT,
ADD COLUMN     "providerApiSecret" TEXT,
ADD COLUMN     "providerUrl" TEXT,
ALTER COLUMN "id" SET DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT;
