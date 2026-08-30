CREATE TYPE "Role" AS ENUM ('PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR','CLIENT_MANAGER','PROFESSIONAL');
CREATE TYPE "FacilityType" AS ENUM ('SCHOOL','HOSPITAL','OFFICE','HOTEL','FACTORY','WAREHOUSE','RETAIL','RESIDENTIAL','OTHER');
CREATE TYPE "RequestStatus" AS ENUM ('NEW','ASSESSMENT','QUOTED','APPROVED','REJECTED','CONVERTED','CANCELLED');
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT','ACTIVE','PAUSED','EXPIRED','TERMINATED');
CREATE TYPE "JobStatus" AS ENUM ('SCHEDULED','CHECKED_IN','IN_PROGRESS','INSPECTION','REWORK','REQUIRED_COMPLETION','COMPLETED','MISSED','CANCELLED');
CREATE TYPE "WorkerStatus" AS ENUM ('PENDING','VERIFIED','ACTIVE','SUSPENDED','INACTIVE');
CREATE TYPE "InspectionResult" AS ENUM ('PASS','FAIL');
CREATE TYPE "ReworkStatus" AS ENUM ('OPEN','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT','ISSUED','SENT','PARTIALLY_PAID','PAID','OVERDUE','VOID','CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','SUCCESS','FAILED','REFUNDED');

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "User" (
  "id" TEXT NOT NULL, "organizationId" TEXT, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Facility" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL, "type" "FacilityType" NOT NULL, "address" TEXT NOT NULL, "areaSqFt" INTEGER, "operatingHours" TEXT, "riskProfile" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ServiceRequest" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "serviceName" TEXT NOT NULL, "requirements" TEXT, "preferredDate" TIMESTAMP(3), "status" "RequestStatus" NOT NULL DEFAULT 'NEW', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Quote" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "monthlyValue" DECIMAL(12,2) NOT NULL, "setupFee" DECIMAL(12,2) NOT NULL DEFAULT 0, "staffingCount" INTEGER NOT NULL, "frequency" TEXT NOT NULL, "slaSummary" TEXT, "validUntil" TIMESTAMP(3) NOT NULL, "approvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Contract" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "name" TEXT NOT NULL, "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT', "monthlyValue" DECIMAL(12,2) NOT NULL, "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Worker" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "classification" TEXT NOT NULL, "specialization" TEXT, "status" "WorkerStatus" NOT NULL DEFAULT 'PENDING', "rating" DECIMAL(3,2) NOT NULL DEFAULT 0, "jobsCompleted" INTEGER NOT NULL DEFAULT 0, "verifiedAt" TIMESTAMP(3),
  CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Job" (
  "id" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "contractId" TEXT, "workerId" TEXT, "scheduledStart" TIMESTAMP(3) NOT NULL, "scheduledEnd" TIMESTAMP(3) NOT NULL, "status" "JobStatus" NOT NULL DEFAULT 'SCHEDULED', "checklistData" JSONB, "checkInAt" TIMESTAMP(3), "checkOutAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Inspection" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "jobId" TEXT NOT NULL, "inspectorUserId" TEXT NOT NULL, "result" "InspectionResult" NOT NULL, "score" DECIMAL(5,2), "checklist" JSONB, "notes" TEXT, "failureReasons" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Rework" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "jobId" TEXT NOT NULL, "inspectionId" TEXT NOT NULL, "assignedWorkerId" TEXT, "reason" TEXT NOT NULL, "correctiveAction" TEXT, "status" "ReworkStatus" NOT NULL DEFAULT 'OPEN', "dueAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Rework_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "contractId" TEXT, "amount" DECIMAL(12,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'INR', "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED', "invoiceNumber" TEXT NOT NULL, "dueDate" TIMESTAMP(3) NOT NULL, "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "amount" DECIMAL(12,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'INR', "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING', "method" TEXT, "reference" TEXT, "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL, "organizationId" TEXT, "actorUserId" TEXT, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
CREATE INDEX "Inspection_organizationId_jobId_idx" ON "Inspection"("organizationId","jobId");
CREATE INDEX "Rework_organizationId_jobId_idx" ON "Rework"("organizationId","jobId");
CREATE INDEX "Invoice_organizationId_status_idx" ON "Invoice"("organizationId","status");
CREATE INDEX "Payment_organizationId_invoiceId_idx" ON "Payment"("organizationId","invoiceId");
CREATE INDEX "AuditEvent_organizationId_createdAt_idx" ON "AuditEvent"("organizationId","createdAt");

ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorUserId_fkey" FOREIGN KEY ("inspectorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rework" ADD CONSTRAINT "Rework_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rework" ADD CONSTRAINT "Rework_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rework" ADD CONSTRAINT "Rework_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rework" ADD CONSTRAINT "Rework_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
