-- CreateTable
CREATE TABLE "_users_connected" (
    "connectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_users_connected_pkey" PRIMARY KEY ("connectionId")
);

-- CreateTable
CREATE TABLE "_users_last_seen" (
    "lastSeenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_users_last_seen_pkey" PRIMARY KEY ("lastSeenId")
);

-- CreateTable
CREATE TABLE "_notifications" (
    "notificationId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "_users_connected_userId_key" ON "_users_connected"("userId");

-- CreateIndex
CREATE INDEX "_users_connected_connectionId_idx" ON "_users_connected"("connectionId");

-- CreateIndex
CREATE INDEX "_users_connected_userId_idx" ON "_users_connected"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_users_last_seen_userId_key" ON "_users_last_seen"("userId");

-- CreateIndex
CREATE INDEX "_users_last_seen_lastSeenId_idx" ON "_users_last_seen"("lastSeenId");

-- CreateIndex
CREATE INDEX "_users_last_seen_userId_idx" ON "_users_last_seen"("userId");

-- CreateIndex
CREATE INDEX "_notifications_notificationId_idx" ON "_notifications"("notificationId");

-- CreateIndex
CREATE INDEX "_notifications_userId_idx" ON "_notifications"("userId");

-- AddForeignKey
ALTER TABLE "_users_connected" ADD CONSTRAINT "_users_connected_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_users_last_seen" ADD CONSTRAINT "_users_last_seen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_notifications" ADD CONSTRAINT "_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
