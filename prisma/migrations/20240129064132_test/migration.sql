/*
  Warnings:

  - You are about to drop the column `timeSlot` on the `_schedule_times` table. All the data in the column will be lost.
  - Added the required column `end` to the `_schedule_times` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `_schedule_times` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "_schedule_times" DROP COLUMN "timeSlot",
ADD COLUMN     "end" TEXT NOT NULL,
ADD COLUMN     "start" TEXT NOT NULL;
