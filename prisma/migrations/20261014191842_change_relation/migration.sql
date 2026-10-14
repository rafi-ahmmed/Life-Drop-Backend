-- DropForeignKey
ALTER TABLE "blood_requests" DROP CONSTRAINT "blood_requests_requestorId_fkey";

-- AddForeignKey
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
