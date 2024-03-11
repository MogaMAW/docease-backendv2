/*
  Warnings:

  - You are about to drop the column `platiform` on the `_session_devices` table. All the data in the column will be lost.
  - Added the required column `platform` to the `_session_devices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "_session_devices" DROP COLUMN "platiform",
ADD COLUMN     "platform" TEXT NOT NULL;
