import express from "express";
import { authenticateMiddleware, protect } from "../controllers/userController";
import {
  confirm2FAToken,
  disableTwoFA,
  enableTwoFA,
  enableTwoFAResponse,
  resendEnableTwoFA,
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
router.post(
  "/resend-enable",
  protect,
  resendEnableTwoFA,
  createSessionDevice,
  enableTwoFAResponse
);
router.patch("/disable/:twofaId", protect, disableTwoFA);
router.patch("/confirm", protect, confirm2FAToken);
router.post(
  "/verify",
  verifyToken,
  createSessionDevice,
  authenticateMiddleware
);

export { router as twoFARoutes };
