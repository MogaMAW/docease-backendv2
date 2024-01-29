-- CreateTable
CREATE TABLE "_schedules" (
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "weekdayNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_schedules_pkey" PRIMARY KEY ("scheduleId")
);

-- CreateTable
CREATE TABLE "_schedule_times" (
    "scheduleTimeId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "weekdayNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_schedule_times_pkey" PRIMARY KEY ("scheduleTimeId")
);

-- CreateIndex
CREATE INDEX "_schedules_scheduleId_idx" ON "_schedules"("scheduleId");

-- CreateIndex
CREATE INDEX "_schedules_userId_idx" ON "_schedules"("userId");

-- CreateIndex
CREATE INDEX "_schedules_weekday_idx" ON "_schedules"("weekday");

-- CreateIndex
CREATE INDEX "_schedule_times_scheduleTimeId_idx" ON "_schedule_times"("scheduleTimeId");

-- CreateIndex
CREATE INDEX "_schedule_times_scheduleId_idx" ON "_schedule_times"("scheduleId");

-- AddForeignKey
ALTER TABLE "_schedules" ADD CONSTRAINT "_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_schedule_times" ADD CONSTRAINT "_schedule_times_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "_schedules"("scheduleId") ON DELETE RESTRICT ON UPDATE CASCADE;
