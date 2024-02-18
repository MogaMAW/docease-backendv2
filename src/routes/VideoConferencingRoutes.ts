import express from "express";
import { protect } from "../controllers/userController";
import {
  getVideoConference,
  joinVideoConference,
} from "../controllers/videoConferencingController";

const router = express.Router();

router.get("/get", protect, getVideoConference);
router.post("/join", protect, joinVideoConference);

export { router as videoConferenceRoutes };
