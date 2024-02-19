import express from "express";
import { protect } from "../controllers/userController";
import {
  getVideoConference,
  getVideoConferenceById,
  joinVideoConference,
} from "../controllers/videoConferencingController";

const router = express.Router();

router.get("/get", protect, getVideoConference);
router.get("/get/:videoConferenceId", protect, getVideoConferenceById);
router.post("/join", protect, joinVideoConference);

export { router as videoConferenceRoutes };
