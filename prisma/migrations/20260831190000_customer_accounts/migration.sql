-- Add the consumer-facing customer role.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CUSTOMER';

-- Link service requests to the customer who created them.
ALTER TABLE "ServiceRequest" ADD COLUMN "customerId" TEXT;

CREATE INDEX "ServiceRequest_customerId_createdAt_idx" ON "ServiceRequest"("customerId", "createdAt");

ALTER TABLE "ServiceRequest"
  ADD CONSTRAINT "ServiceRequest_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;