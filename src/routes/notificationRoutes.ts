import express from "express";
import { protect } from "../controllers/userController";
import {
  getLiveConferenceNotifications,
  getLiveNotifications,
  getNotificationsByUser,
  markNotificationAsRead,
} from "../controllers/notificationController";

const router = express.Router();

router.get("/get-live-notifications", protect, getLiveNotifications);
router.get(
  "/get-live-conf-notifications",
  protect,
  getLiveConferenceNotifications
);
router.get("/get-by-user", protect, getNotificationsByUser);
router.patch("/mark-as-read/:notificationId", protect, markNotificationAsRead);

export { router as notificationRoutes };
