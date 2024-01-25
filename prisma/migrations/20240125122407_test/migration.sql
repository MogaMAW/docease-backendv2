-- CreateTable
CREATE TABLE "_access_tokens" (
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_access_tokens_pkey" PRIMARY KEY ("tokenId")
);

-- CreateIndex
CREATE INDEX "_access_tokens_tokenId_idx" ON "_access_tokens"("tokenId");

-- CreateIndex
CREATE INDEX "_access_tokens_userId_idx" ON "_access_tokens"("userId");

-- CreateIndex
CREATE INDEX "_access_tokens_token_idx" ON "_access_tokens"("token");

-- AddForeignKey
ALTER TABLE "_access_tokens" ADD CONSTRAINT "_access_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
