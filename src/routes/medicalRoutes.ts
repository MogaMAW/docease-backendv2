import express from "express";
import { protect } from "../controllers/userController";
import {
  deleteMedicalRecord,
  deleteMedicalRecordFile,
  getMedicalRecordByUser,
  getMedicalRecordFileByUser,
  postMedicalRecord,
  postMedicalRecordFile,
} from "../controllers/medicalController";
import { uploadFile } from "../utils/upload";

const router = express.Router();

router.post("/post", protect, postMedicalRecord);
router.get("/get-by-user", protect, getMedicalRecordByUser);
router.delete("/delete/:medicalRecordId", protect, deleteMedicalRecord);
router.post("/post-file", uploadFile, protect, postMedicalRecordFile);
router.get("/get-files-by-user", protect, getMedicalRecordFileByUser);
router.delete("/delete-file/:medicalFileId", protect, deleteMedicalRecordFile);

export { router as medicalRecordRoutes };
