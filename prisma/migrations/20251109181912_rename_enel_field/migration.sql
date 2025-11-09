/*
  Warnings:

  - You are about to drop the column `enelInvoiceUrl` on the `client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "client" DROP COLUMN "enelInvoiceUrl",
ADD COLUMN     "enelInvoiceFile" TEXT,
ALTER COLUMN "id" SET DEFAULT (concat('client_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "faq" ALTER COLUMN "id" SET DEFAULT (concat('faq_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "generation_unit" ALTER COLUMN "id" SET DEFAULT (concat('generation_unit_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "indication" ALTER COLUMN "id" SET DEFAULT (concat('indication_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "inverter" ALTER COLUMN "id" SET DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "offer" ALTER COLUMN "id" SET DEFAULT (concat('offer_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "id" SET DEFAULT (concat('transaction_', gen_random_uuid()))::TEXT;
