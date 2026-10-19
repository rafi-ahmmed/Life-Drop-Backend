-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BKASH', 'STRIPE');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentID" TEXT NOT NULL,
    "trxID" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL DEFAULT 'BKASH',

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentID_key" ON "payments"("paymentID");

-- CreateIndex
CREATE UNIQUE INDEX "payments_trxID_key" ON "payments"("trxID");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "fund_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
