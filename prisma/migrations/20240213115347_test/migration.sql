/*
  Warnings:

  - The primary key for the `_devices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userDeviceId` on the `_devices` table. All the data in the column will be lost.
  - The required column `deviceId` was added to the `_devices` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "_devices_userDeviceId_idx";

-- AlterTable
ALTER TABLE "_devices" DROP CONSTRAINT "_devices_pkey",
DROP COLUMN "userDeviceId",
ADD COLUMN     "deviceId" TEXT NOT NULL,
ADD CONSTRAINT "_devices_pkey" PRIMARY KEY ("deviceId");

-- CreateIndex
CREATE INDEX "_devices_deviceId_idx" ON "_devices"("deviceId");
