-- CreateIndex
CREATE INDEX "invitation_companyId_acceptedAt_idx" ON "invitation"("companyId", "acceptedAt");

-- CreateIndex
CREATE INDEX "request_companyId_updatedAt_idx" ON "request"("companyId", "updatedAt");

-- CreateIndex
CREATE INDEX "invoice_companyId_status_idx" ON "invoice"("companyId", "status");
