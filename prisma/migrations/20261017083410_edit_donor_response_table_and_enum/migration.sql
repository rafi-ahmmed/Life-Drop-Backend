/*
  Warnings:

  - You are about to drop the `donor_responses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DonorRequestStatus" AS ENUM ('PENDING', 'INTERESTED', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "donor_responses" DROP CONSTRAINT "donor_responses_donorId_fkey";

-- DropForeignKey
ALTER TABLE "donor_responses" DROP CONSTRAINT "donor_responses_requestId_fkey";

-- DropTable
DROP TABLE "donor_responses";

-- DropEnum
DROP TYPE "DonorResponseStatus";

-- CreateTable
CREATE TABLE "donor_requests" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" "DonorRequestStatus" NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donor_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donor_requests_donorId_requestId_key" ON "donor_requests"("donorId", "requestId");

-- AddForeignKey
ALTER TABLE "donor_requests" ADD CONSTRAINT "donor_requests_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_requests" ADD CONSTRAINT "donor_requests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
