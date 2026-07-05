-- CreateTable
CREATE TABLE "GuidePoint" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "photoData" BYTEA,
    "photoMimeType" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuidePoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuidePoint_stepId_key" ON "GuidePoint"("stepId");

