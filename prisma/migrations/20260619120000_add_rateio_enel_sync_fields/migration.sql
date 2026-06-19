-- AlterTable
ALTER TABLE "public"."credit_allocation" ADD COLUMN     "appliedAt" TIMESTAMP(3),
ADD COLUMN     "appliedByUserId" TEXT,
ADD COLUMN     "effectiveDate" DATE,
ADD COLUMN     "enelProtocol" TEXT,
ADD COLUMN     "enelSyncStatus" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "requestedAt" TIMESTAMP(3),
ADD COLUMN     "requestedByUserId" TEXT,
ADD COLUMN     "syncError" TEXT;

-- CreateIndex
CREATE INDEX "credit_allocation_enelSyncStatus_idx" ON "public"."credit_allocation"("enelSyncStatus");
