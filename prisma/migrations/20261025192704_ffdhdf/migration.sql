-- DropForeignKey
ALTER TABLE "donor_requests" DROP CONSTRAINT "donor_requests_donorId_fkey";

-- AddForeignKey
ALTER TABLE "donor_requests" ADD CONSTRAINT "donor_requests_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
