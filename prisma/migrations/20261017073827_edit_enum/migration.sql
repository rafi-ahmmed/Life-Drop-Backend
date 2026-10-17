/*
  Warnings:

  - The values [WITHDRAWN] on the enum `DonorResponseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DonorResponseStatus_new" AS ENUM ('PENDING', 'INTERESTED', 'ACCEPTED', 'DECLINED', 'CANCELLED');
ALTER TABLE "donor_responses" ALTER COLUMN "status" TYPE "DonorResponseStatus_new" USING ("status"::text::"DonorResponseStatus_new");
ALTER TYPE "DonorResponseStatus" RENAME TO "DonorResponseStatus_old";
ALTER TYPE "DonorResponseStatus_new" RENAME TO "DonorResponseStatus";
DROP TYPE "public"."DonorResponseStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "donor_responses" ALTER COLUMN "status" SET DEFAULT 'PENDING';
