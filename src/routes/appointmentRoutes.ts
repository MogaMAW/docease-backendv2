import express from "express";
import { protect } from "../controllers/userController";
import {
  deleteAppointment,
  getAllAppointments,
  getAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  postAppointment,
  updateAppointment,
} from "../controllers/appointmentController";

const router = express.Router();

router.post("/post", protect, postAppointment);
router.patch("/update/:appointmentId", protect, updateAppointment);
router.get("/get/:appointmentId", protect, getAppointment);
router.get("/get-all-appointments", protect, getAllAppointments);
router.get("/get-by-doctor", protect, getAppointmentsByDoctor);
router.get("/get-by-patient", protect, getAppointmentsByPatient);
router.delete("/delete/:appointmentId", protect, deleteAppointment);

export { router as appointmentRoutes };
