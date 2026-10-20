/*
  Warnings:

  - You are about to drop the column `donorId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentID` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bkashPaymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_donorId_fkey";

-- DropIndex
DROP INDEX "payments_paymentID_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "donorId",
DROP COLUMN "paymentID",
ADD COLUMN     "bkashPaymentId" TEXT,
ADD COLUMN     "gatewayResponse" JSONB,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_bkashPaymentId_key" ON "payments"("bkashPaymentId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
