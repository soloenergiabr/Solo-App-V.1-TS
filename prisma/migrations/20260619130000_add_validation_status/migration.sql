-- AlterTable
ALTER TABLE "public"."plant" ADD COLUMN "validationStatus" TEXT NOT NULL DEFAULT 'pending_review';

-- AlterTable
ALTER TABLE "public"."consumer_unit" ADD COLUMN "validationStatus" TEXT NOT NULL DEFAULT 'pending_review';
