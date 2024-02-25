import express from "express";
import { protect } from "../controllers/userController";
import {
  getLiveConferenceNotifications,
  getLiveNotifications,
} from "../controllers/notificationController";

const router = express.Router();

router.get("/get-live-notifications", protect, getLiveNotifications);
router.get(
  "/get-live-conf-notifications",
  protect,
  getLiveConferenceNotifications
);

export { router as notificationRoutes };
