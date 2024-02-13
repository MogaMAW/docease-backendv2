/*
  Warnings:

  - A unique constraint covering the columns `[devicePlatform]` on the table `_devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `devicePlatform` to the `_devices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "_devices" ADD COLUMN     "devicePlatform" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_devices_devicePlatform_key" ON "_devices"("devicePlatform");
