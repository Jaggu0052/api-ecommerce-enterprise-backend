CREATE TYPE "LogType" AS ENUM ('REQUEST', 'RESPONSE', 'ERROR', 'PRISMA', 'AUTH', 'AUDIT', 'SECURITY', 'PERFORMANCE');

CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "type" "LogType" NOT NULL,
    "endpoint" TEXT,
    "method" TEXT,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "executionTime" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LogEntry_type_idx" ON "LogEntry"("type");
CREATE INDEX "LogEntry_requestId_idx" ON "LogEntry"("requestId");
CREATE INDEX "LogEntry_createdAt_idx" ON "LogEntry"("createdAt");
