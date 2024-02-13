/*
  Warnings:

  - The primary key for the `_notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "_notifications" DROP CONSTRAINT "_notifications_pkey",
ALTER COLUMN "notificationId" DROP DEFAULT,
ALTER COLUMN "notificationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "_notifications_pkey" PRIMARY KEY ("notificationId");
DROP SEQUENCE "_notifications_notificationId_seq";

-- CreateTable
CREATE TABLE "_devices" (
    "userDeviceId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "devicePlatform" TEXT NOT NULL,
    "isDisable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_devices_pkey" PRIMARY KEY ("userDeviceId")
);

-- CreateIndex
CREATE INDEX "_devices_userDeviceId_idx" ON "_devices"("userDeviceId");

-- CreateIndex
CREATE INDEX "_devices_userId_idx" ON "_devices"("userId");

-- AddForeignKey
ALTER TABLE "_devices" ADD CONSTRAINT "_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
