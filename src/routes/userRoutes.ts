import express from "express";
import {
  setUserRole,
  signUp,
  signIn,
  resetPassword,
  forgotPassword,
  changePassword,
  editUserDetails,
  updateUserImage,
  protect,
  getUser,
  getUserByRole,
} from "../controllers/userController";
import { uploadFile } from "../utils/upload";

const router = express.Router();

router.post("/patients/signup", setUserRole, signUp);
router.post("/doctors/signup", setUserRole, signUp);
router.post("/admins/signup", setUserRole, signUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/edit-user-details/:userId", protect, editUserDetails);
router.patch(
  "/update-user-image/:userId",
  uploadFile,
  protect,
  updateUserImage
);
router.patch("/change-password/:userId", protect, changePassword);
router.get("/get-user/:userId", protect, getUser);
router.get("/get-user-by-role", protect, getUserByRole);

export { router as userRoutes };
