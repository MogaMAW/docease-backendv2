import express from "express";
import { protect } from "../controllers/userController";

import { getDoctorsPatients } from "../controllers/doctorsPatientController";

const router = express.Router();

router.get("/get-by-doctor", protect, getDoctorsPatients);

export { router as doctorsPatientsRoutes };
