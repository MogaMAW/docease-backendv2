-- CreateTable
CREATE TABLE "_medical_files" (
    "medicalFileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_medical_files_pkey" PRIMARY KEY ("medicalFileId")
);

-- CreateTable
CREATE TABLE "_medical_records" (
    "medicalRecordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "illness" TEXT NOT NULL,
    "diet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "_medical_records_pkey" PRIMARY KEY ("medicalRecordId")
);

-- CreateIndex
CREATE INDEX "_medical_files_medicalFileId_idx" ON "_medical_files"("medicalFileId");

-- CreateIndex
CREATE INDEX "_medical_files_userId_idx" ON "_medical_files"("userId");

-- CreateIndex
CREATE INDEX "_medical_records_medicalRecordId_idx" ON "_medical_records"("medicalRecordId");

-- CreateIndex
CREATE INDEX "_medical_records_userId_idx" ON "_medical_records"("userId");

-- AddForeignKey
ALTER TABLE "_medical_files" ADD CONSTRAINT "_medical_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_medical_records" ADD CONSTRAINT "_medical_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
