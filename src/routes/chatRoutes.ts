import express from "express";
import { protect } from "../controllers/userController";
import { uploadFile } from "../utils/upload";
import {
  getChatRecipients,
  getChatMessagesByChatRoom,
} from "../controllers/chatController";

const router = express.Router();

router.get("/get-chat-recipients/:userId", protect, getChatRecipients);
router.get("/get-chat-messages", protect, getChatMessagesByChatRoom);

export { router as chatRoutes };
