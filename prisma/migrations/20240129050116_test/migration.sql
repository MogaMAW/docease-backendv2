/*
  Warnings:

  - You are about to drop the column `weekday` on the `_schedule_times` table. All the data in the column will be lost.
  - You are about to drop the column `weekdayNum` on the `_schedule_times` table. All the data in the column will be lost.
  - Added the required column `timeSlot` to the `_schedule_times` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `weekday` on the `_schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- AlterTable
ALTER TABLE "_schedule_times" DROP COLUMN "weekday",
DROP COLUMN "weekdayNum",
ADD COLUMN     "timeSlot" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "_schedules" DROP COLUMN "weekday",
ADD COLUMN     "weekday" "Weekday" NOT NULL;

-- CreateIndex
CREATE INDEX "_schedules_weekday_idx" ON "_schedules"("weekday");
