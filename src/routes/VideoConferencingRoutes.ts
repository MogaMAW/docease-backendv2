import express from "express";
import { protect } from "../controllers/userController";
import { getVideoConference } from "../controllers/videoConferencingController";

const router = express.Router();

router.get("/get", protect, getVideoConference);

export { router as videoConferenceRoutes };
