import express from "express";
import { protect } from "../controllers/userController";
import {
  getMentalHealthAssessment,
  getMentalHealthAssessmentsByUser,
  postMentalHealthAssessment,
} from "../controllers/mentalHealthController";

const router = express.Router();

router.post("/post", protect, postMentalHealthAssessment);
router.get("/get/:mentalHealthId", protect, getMentalHealthAssessment);
router.get("/get-by-user", protect, getMentalHealthAssessmentsByUser);

export { router as mentalHealthRoutes };
