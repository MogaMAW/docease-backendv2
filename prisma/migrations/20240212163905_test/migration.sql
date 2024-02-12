/*
  Warnings:

  - You are about to drop the `_users_connected` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_users_last_seen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_users_connected" DROP CONSTRAINT "_users_connected_userId_fkey";

-- DropForeignKey
ALTER TABLE "_users_last_seen" DROP CONSTRAINT "_users_last_seen_userId_fkey";

-- DropTable
DROP TABLE "_users_connected";

-- DropTable
DROP TABLE "_users_last_seen";

-- CreateTable
CREATE TABLE "_online_statuses" (
    "onlineStatusId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_online_statuses_pkey" PRIMARY KEY ("onlineStatusId")
);

-- CreateIndex
CREATE UNIQUE INDEX "_online_statuses_userId_key" ON "_online_statuses"("userId");

-- CreateIndex
CREATE INDEX "_online_statuses_onlineStatusId_idx" ON "_online_statuses"("onlineStatusId");

-- CreateIndex
CREATE INDEX "_online_statuses_userId_idx" ON "_online_statuses"("userId");

-- AddForeignKey
ALTER TABLE "_online_statuses" ADD CONSTRAINT "_online_statuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
