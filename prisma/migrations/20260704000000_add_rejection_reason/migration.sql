-- AlterTable: add rejectionReason to Plant and ConsumerUnit
-- Used by the admin approvals queue to capture why an item was rejected.

ALTER TABLE "public"."plant" ADD COLUMN "rejectionReason" TEXT;

ALTER TABLE "public"."consumer_unit" ADD COLUMN "rejectionReason" TEXT;
