-- CreateTable
CREATE TABLE "_video_conferencies" (
    "videoConferenceId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_video_conferencies_pkey" PRIMARY KEY ("videoConferenceId")
);

-- CreateIndex
CREATE INDEX "_video_conferencies_videoConferenceId_idx" ON "_video_conferencies"("videoConferenceId");

-- CreateIndex
CREATE INDEX "_video_conferencies_hostId_idx" ON "_video_conferencies"("hostId");

-- CreateIndex
CREATE INDEX "_video_conferencies_attendeeId_idx" ON "_video_conferencies"("attendeeId");

-- AddForeignKey
ALTER TABLE "_video_conferencies" ADD CONSTRAINT "_video_conferencies_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_video_conferencies" ADD CONSTRAINT "_video_conferencies_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
