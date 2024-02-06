-- CreateTable
CREATE TABLE "_mental_health" (
    "mentalHealthId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answeredQuestions" JSONB NOT NULL,
    "aiResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_mental_health_pkey" PRIMARY KEY ("mentalHealthId")
);

-- CreateIndex
CREATE INDEX "_mental_health_mentalHealthId_idx" ON "_mental_health"("mentalHealthId");

-- CreateIndex
CREATE INDEX "_mental_health_userId_idx" ON "_mental_health"("userId");

-- AddForeignKey
ALTER TABLE "_mental_health" ADD CONSTRAINT "_mental_health_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
