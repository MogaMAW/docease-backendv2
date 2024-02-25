-- CreateTable
CREATE TABLE "_doctors_patients" (
    "doctorsPatientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_doctors_patients_pkey" PRIMARY KEY ("doctorsPatientId")
);

-- CreateIndex
CREATE INDEX "_doctors_patients_doctorsPatientId_idx" ON "_doctors_patients"("doctorsPatientId");

-- CreateIndex
CREATE INDEX "_doctors_patients_doctorId_idx" ON "_doctors_patients"("doctorId");

-- CreateIndex
CREATE INDEX "_doctors_patients_patientId_idx" ON "_doctors_patients"("patientId");

-- AddForeignKey
ALTER TABLE "_doctors_patients" ADD CONSTRAINT "_doctors_patients_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_doctors_patients" ADD CONSTRAINT "_doctors_patients_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
