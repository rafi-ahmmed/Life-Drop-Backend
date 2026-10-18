/*
  Warnings:

  - The values [CANCELLED] on the enum `BloodRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BloodRequestStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MATCHING', 'FULFILLED', 'EXPIRED');
ALTER TABLE "public"."blood_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "blood_requests" ALTER COLUMN "status" TYPE "BloodRequestStatus_new" USING ("status"::text::"BloodRequestStatus_new");
ALTER TYPE "BloodRequestStatus" RENAME TO "BloodRequestStatus_old";
ALTER TYPE "BloodRequestStatus_new" RENAME TO "BloodRequestStatus";
DROP TYPE "public"."BloodRequestStatus_old";
ALTER TABLE "blood_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "DonorRequestStatus" ADD VALUE 'WITHDRAWN';

-- AlterTable
ALTER TABLE "donor_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
