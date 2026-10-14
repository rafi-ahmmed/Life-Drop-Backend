-- CreateEnum
CREATE TYPE "BloodRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MATCHING', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DonorResponseStatus" AS ENUM ('INTERESTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "donors" ALTER COLUMN "availability" SET DEFAULT true;

-- CreateTable
CREATE TABLE "blood_requests" (
    "id" TEXT NOT NULL,
    "requestorId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "phone" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neededAt" TIMESTAMP(3) NOT NULL,
    "urgency" BOOLEAN NOT NULL DEFAULT false,
    "status" "BloodRequestStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blood_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blood_requests_requestorId_key" ON "blood_requests"("requestorId");

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
