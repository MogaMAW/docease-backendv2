import express from "express";
import { protect } from "../controllers/userController";
import {
  approveAppointment,
  cancelAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  postAppointment,
  rescheduleAppointment,
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
router.patch("/reschedule/:appointmentId", protect, rescheduleAppointment);
router.patch("/approve/:appointmentId", protect, approveAppointment);
router.patch("/cancel/:appointmentId", protect, cancelAppointment);

export { router as appointmentRoutes };
