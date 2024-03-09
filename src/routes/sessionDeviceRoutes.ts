import express from "express";
import { protect } from "../controllers/userController";
import {
  getSessionDevice,
  getSessionDevicesByUser,
} from "../controllers/sessionDeviceController";

const router = express.Router();

router.get("/get/:sessionDeviceId", protect, getSessionDevice);
router.get("/get-by-user", protect, getSessionDevicesByUser);

export { router as sessionDeviceRoutes };
