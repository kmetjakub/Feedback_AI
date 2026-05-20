-- CreateTable
CREATE TABLE "Insight" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Insight_projectId_key" ON "Insight"("projectId");

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
