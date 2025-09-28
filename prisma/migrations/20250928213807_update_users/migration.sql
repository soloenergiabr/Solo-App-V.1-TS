/*
  Warnings:

  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."client" ALTER COLUMN "id" SET DEFAULT (concat('client_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."generation_unit" ALTER COLUMN "id" SET DEFAULT (concat('generation_unit_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."inverter" ALTER COLUMN "id" SET DEFAULT (concat('inverter_', gen_random_uuid()))::TEXT;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY['read_inverters', 'create_inverter', 'read_generation_data', 'create_generation_unit']::TEXT[],
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['user']::TEXT[],
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE INDEX "user_clientId_idx" ON "public"."user"("clientId");

-- CreateIndex
CREATE INDEX "user_email_isActive_idx" ON "public"."user"("email", "isActive");
