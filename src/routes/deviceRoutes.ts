import express from "express";
import { protect } from "../controllers/userController";
import {
  deleteDevice,
  disableDevice,
  getDevice,
  getDeviceByUser,
  postDevice,
  unDisableDevice,
} from "../controllers/deviceController";

const router = express.Router();

router.post("/post", protect, postDevice);
router.get("/get/:deviceId", protect, getDevice);
router.get("/get", protect, getDeviceByUser);
router.delete("/delete/:deviceId", protect, deleteDevice);
router.patch("/disable/:deviceId", protect, disableDevice);
router.patch("/un-disable/:deviceId", protect, unDisableDevice);

export { router as deviceRoutes };
