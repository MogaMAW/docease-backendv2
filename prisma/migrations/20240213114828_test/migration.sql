/*
  Warnings:

  - You are about to drop the column `devicePlatform` on the `_devices` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deviceToken]` on the table `_devices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_devices" DROP COLUMN "devicePlatform";

-- CreateIndex
CREATE UNIQUE INDEX "_devices_deviceToken_key" ON "_devices"("deviceToken");

-- CreateIndex
CREATE INDEX "_devices_deviceToken_idx" ON "_devices"("deviceToken");
