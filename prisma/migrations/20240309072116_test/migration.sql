/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `_two_fa` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "_session_devices" (
    "sessionDeviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platiform" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "browserVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_session_devices_pkey" PRIMARY KEY ("sessionDeviceId")
);

-- CreateTable
CREATE TABLE "_verification_tokens" (
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_verification_tokens_pkey" PRIMARY KEY ("tokenId")
);

-- CreateIndex
CREATE INDEX "_session_devices_sessionDeviceId_idx" ON "_session_devices"("sessionDeviceId");

-- CreateIndex
CREATE INDEX "_session_devices_userId_idx" ON "_session_devices"("userId");

-- CreateIndex
CREATE INDEX "_verification_tokens_userId_idx" ON "_verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "_verification_tokens_token_idx" ON "_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "_two_fa_userId_key" ON "_two_fa"("userId");

-- AddForeignKey
ALTER TABLE "_session_devices" ADD CONSTRAINT "_session_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_verification_tokens" ADD CONSTRAINT "_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
