CREATE TYPE "AutomationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'RETRY', 'DEAD_LETTER');

CREATE TABLE "AutomationJob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "eventKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "AutomationJobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AutomationJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AutomationJob_eventKey_key" ON "AutomationJob"("eventKey");
CREATE INDEX "AutomationJob_status_runAt_idx" ON "AutomationJob"("status", "runAt");
CREATE INDEX "AutomationJob_organizationId_createdAt_idx" ON "AutomationJob"("organizationId", "createdAt");
