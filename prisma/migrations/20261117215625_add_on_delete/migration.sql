-- DropForeignKey
ALTER TABLE "donor_requests" DROP CONSTRAINT "donor_requests_requestId_fkey";

-- AddForeignKey
ALTER TABLE "donor_requests" ADD CONSTRAINT "donor_requests_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
