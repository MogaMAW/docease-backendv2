import express from "express";
import { protect } from "../controllers/userController";
import { getLiveNotifications } from "../controllers/notificationController";

const router = express.Router();

router.get("/get-live-notifications", protect, getLiveNotifications);

export { router as notificationRoutes };
