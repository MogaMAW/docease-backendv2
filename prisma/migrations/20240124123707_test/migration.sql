-- CreateEnum
CREATE TYPE "AppointmentStatusEnum" AS ENUM ('pending', 'edited', 'approved', 'cancelled', 'done');

-- CreateTable
CREATE TABLE "_appointments" (
    "appointmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "doctorsComment" TEXT,
    "patientsComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_appointments_pkey" PRIMARY KEY ("appointmentId")
);

-- CreateTable
CREATE TABLE "_appointment_statuses" (
    "appointmentStatusId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "status" "AppointmentStatusEnum" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_appointment_statuses_pkey" PRIMARY KEY ("appointmentStatusId")
);

-- CreateIndex
CREATE INDEX "_appointments_appointmentId_idx" ON "_appointments"("appointmentId");

-- CreateIndex
CREATE INDEX "_appointments_patientId_idx" ON "_appointments"("patientId");

-- CreateIndex
CREATE INDEX "_appointments_doctorId_idx" ON "_appointments"("doctorId");

-- CreateIndex
CREATE INDEX "_appointment_statuses_appointmentStatusId_idx" ON "_appointment_statuses"("appointmentStatusId");

-- CreateIndex
CREATE INDEX "_appointment_statuses_appointmentId_idx" ON "_appointment_statuses"("appointmentId");

-- CreateIndex
CREATE INDEX "_appointment_statuses_status_idx" ON "_appointment_statuses"("status");

-- AddForeignKey
ALTER TABLE "_appointments" ADD CONSTRAINT "_appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_appointments" ADD CONSTRAINT "_appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_appointment_statuses" ADD CONSTRAINT "_appointment_statuses_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "_appointments"("appointmentId") ON DELETE RESTRICT ON UPDATE CASCADE;
