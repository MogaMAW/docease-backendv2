-- CreateTable
CREATE TABLE "_two_fa" (
    "twofaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_two_fa_pkey" PRIMARY KEY ("twofaId")
);

-- CreateIndex
CREATE INDEX "_two_fa_twofaId_idx" ON "_two_fa"("twofaId");

-- CreateIndex
CREATE INDEX "_two_fa_userId_idx" ON "_two_fa"("userId");

-- AddForeignKey
ALTER TABLE "_two_fa" ADD CONSTRAINT "_two_fa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
