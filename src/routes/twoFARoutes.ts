import express from "express";
import { authenticateMiddleware, protect } from "../controllers/userController";
import {
  disableTwoFA,
  enableTwoFA,
  enableTwoFAResponse,
  verifyToken,
} from "../controllers/twoFAController";
import { createSessionDevice } from "../controllers/sessionDeviceController";

const router = express.Router();

router.post(
  "/enable",
  protect,
  enableTwoFA,
  createSessionDevice,
  enableTwoFAResponse
);
router.patch("/disable/:twofaId", protect, disableTwoFA);
router.post("/verify", protect, verifyToken, authenticateMiddleware);

export { router as twoFARoutes };
