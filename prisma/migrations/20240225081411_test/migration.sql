-- CreateTable
CREATE TABLE "_chats" (
    "messageId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_chats_pkey" PRIMARY KEY ("messageId")
);

-- CreateIndex
CREATE INDEX "_chats_senderId_idx" ON "_chats"("senderId");

-- CreateIndex
CREATE INDEX "_chats_recipientId_idx" ON "_chats"("recipientId");

-- CreateIndex
CREATE INDEX "_chats_chatRoomId_idx" ON "_chats"("chatRoomId");

-- AddForeignKey
ALTER TABLE "_chats" ADD CONSTRAINT "_chats_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chats" ADD CONSTRAINT "_chats_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
