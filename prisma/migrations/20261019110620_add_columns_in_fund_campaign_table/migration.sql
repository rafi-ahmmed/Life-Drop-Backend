/*
  Warnings:

  - Added the required column `contactNumber` to the `fund_campaigns` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `fund_campaigns` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "fund_campaigns" ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "hospitalName" TEXT,
ADD COLUMN     "rejectedReason" TEXT,
ALTER COLUMN "userId" SET NOT NULL;
