import express from "express";
import { protect } from "../controllers/userController";

import {
  getOnlineStatus,
  getOnlineUsers,
  updateOnlineStatus,
} from "../controllers/statusController";

const router = express.Router();

router.patch("/update", protect, updateOnlineStatus);
router.get("/get", protect, getOnlineStatus);
router.get("/get-online-users", protect, getOnlineUsers);

export { router as statusRoutes };
