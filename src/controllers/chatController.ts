import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";
import { notification } from "../utils/notification";
import { TChatMessage } from "../types/chat";

const prisma = new PrismaClient();
const Chat = prisma.chat;
const User = prisma.user;

export const getChatRecipients = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  if (!userId) return next(new AppError("No userId if provided", 400));

  const recipients = await User.findMany({
    where: {
      userId: { not: userId },
    },
    select: {
      userId: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      role: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Recipients fetched successfully",
    data: {
      recipients: recipients,
    },
  });
});

export const getChatMessagesByChatRoom = asyncHandler(
  async (req, res, next) => {
    const chatRoomId = req.query.chatRoomId as string;
    console.log("chatRoomId", chatRoomId);

    if (!chatRoomId) {
      return next(new AppError("please provide chatRoomId", 400));
    }

    // const messages = await Chat.findMany({
    //   where: {
    //     OR: [
    //       { senderId: { equals: userId } },
    //       { recipientId: { equals: userId } },
    //     ],
    //   },
    // });

    // TODO: include pagination here
    const messages = await Chat.findMany({
      where: {
        chatRoomId: { equals: chatRoomId },
      },
    });

    if (!messages) {
      return next(new AppError("No chat messages yet", 404));
    }

    res.status(200).json({
      status: "success",
      message: "chat messages fetched successfully",
      data: { messages: messages },
    });
  }
);

const saveChatMessage = async (message: any) => {
  if (message.type) message.type = undefined;

  await Chat.create({ data: message });
  console.log("message saved");
};

const joinRoom = (socket: Socket) => {
  socket.on("joinRoom", (chatIds) => {
    const chatRoomId: string = chatIds.chatRoomId;
    socket.join(chatRoomId);
    console.log("user joined rooms with ids", chatRoomId);
  });
};

const receiveSendMessage = (socket: Socket) => {
  socket.on("sendChatMessage", async (message: TChatMessage) => {
    console.log("Message sent: ", message);

    // TODO: to trigger event notifications
    // notification.emitNotificationEvent({
    //   // userId: message.senderId,
    //   userId: message.recipientId,
    //   message: "This live notification test on the chat backend",
    // });

    socket.to(message.chatRoomId).emit("receiveChatMessage", message);
    await saveChatMessage(message);
  });
};

const leaveChatRoom = (socket: Socket) => {
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
};

export const chatHandler = (io: any) => {
  io.on("connection", (socket: Socket) => {
    console.log("socket id: " + socket.id);
    joinRoom(socket);
    receiveSendMessage(socket);
    leaveChatRoom(socket);
  });
};
