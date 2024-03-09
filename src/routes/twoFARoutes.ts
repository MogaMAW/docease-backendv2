import express from "express";
import { authenticateMiddleware, protect } from "../controllers/userController";
import {
  disableTwoFA,
  enableTwoFA,
  verifyToken,
} from "../controllers/twoFAController";

const router = express.Router();

router.post("/enable", protect, enableTwoFA);
router.patch("/disable/:twofaId", protect, disableTwoFA);
router.post("/verify", protect, verifyToken, authenticateMiddleware);

export { router as twoFARoutes };
