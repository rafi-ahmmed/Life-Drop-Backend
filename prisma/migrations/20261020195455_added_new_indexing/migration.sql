-- CreateIndex
CREATE INDEX "blood_requests_requestorId_createdAt_idx" ON "blood_requests"("requestorId", "createdAt");
