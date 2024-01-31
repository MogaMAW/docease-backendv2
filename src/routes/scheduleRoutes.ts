import express from "express";
import { protect } from "../controllers/userController";
import {
  deleteSchedule,
  deleteScheduleTime,
  getSchedule,
  getSchedulesByUser,
  postSchedule,
  postScheduleTime,
  updateScheduleTime,
} from "../controllers/scheduleController";

const router = express.Router();

router.post("/post", protect, postSchedule);
router.get("/get/:scheduleId", protect, getSchedule);
router.get("/get-by-user", protect, getSchedulesByUser);
router.delete("/delete/:scheduleId", protect, deleteSchedule);
router.post("/post-schedule-time", protect, postScheduleTime);
router.patch("/update-schedule-time", protect, updateScheduleTime);
router.delete("/delete-schedule-time", protect, deleteScheduleTime);

export { router as scheduleRoutes };
