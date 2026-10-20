/*
  Warnings:

  - Made the column `bkashPaymentId` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "trxID" DROP NOT NULL,
ALTER COLUMN "bkashPaymentId" SET NOT NULL;
