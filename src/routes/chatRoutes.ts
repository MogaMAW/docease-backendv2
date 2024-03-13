import express from "express";
import { protect } from "../controllers/userController";
import { uploadFile } from "../utils/upload";
import {
  getChatRecipients,
  getChatMessagesByChatRoom,
  postChat,
  getLiveChat,
} from "../controllers/chatController";

const router = express.Router();

// router.get("/get-chat-recipients/:userId", protect, getChatRecipients);
router.get("/get-chat-recipients", protect, getChatRecipients);
router.post("/post", protect, postChat);
router.get("/get-chat-messages", protect, getChatMessagesByChatRoom);
router.get("/get-live-chat", protect, getLiveChat);

export { router as chatRoutes };
