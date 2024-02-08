import express from "express";
import { getActiveStatus } from "../controllers/keepActiveController";

const router = express.Router();

router.get("/active", getActiveStatus);

export { router as keepActiveRoutes };
