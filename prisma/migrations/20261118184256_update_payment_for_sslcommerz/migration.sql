/*
  Warnings:

  - You are about to drop the column `bkashPaymentId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_bkashPaymentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "bkashPaymentId",
ADD COLUMN     "bankTranId" TEXT,
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "paymentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentId_key" ON "payments"("paymentId");
