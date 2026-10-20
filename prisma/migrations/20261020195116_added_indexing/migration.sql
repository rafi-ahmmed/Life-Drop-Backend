-- CreateIndex
CREATE INDEX "blood_requests_status_createdAt_idx" ON "blood_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "blood_requests_bloodGroup_status_idx" ON "blood_requests"("bloodGroup", "status");

-- CreateIndex
CREATE INDEX "blood_requests_urgency_status_idx" ON "blood_requests"("urgency", "status");

-- CreateIndex
CREATE INDEX "donors_bloodGroup_district_availability_idx" ON "donors"("bloodGroup", "district", "availability");

-- CreateIndex
CREATE INDEX "fund_campaigns_status_createdAt_idx" ON "fund_campaigns"("status", "createdAt");

-- CreateIndex
CREATE INDEX "fund_campaigns_status_deadline_idx" ON "fund_campaigns"("status", "deadline");

-- CreateIndex
CREATE INDEX "payments_userId_paidAt_idx" ON "payments"("userId", "paidAt");

-- CreateIndex
CREATE INDEX "payments_status_paidAt_idx" ON "payments"("status", "paidAt");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");
