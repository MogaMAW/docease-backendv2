import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";
import { notification } from "../utils/notification";
import { TChatExtended, TChatMessage, TChatRecipient } from "../types/chat";

const prisma = new PrismaClient();
const Chat = prisma.chat;
const User = prisma.user;

export const postChat = asyncHandler(async (req, res, next) => {
  const chatMessage = await Chat.create({
    data: req.body,
  });

  notification.emitChatEvent(req.body);

  res.status(200).json({
    status: "success",
    message: "chat created",
  });
});

const chatResponseMap = new Map<string, Response>();

export const getLiveChat = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.status(200);

    const userId = res.locals.user.userId as string;
    if (!userId) return next(new AppError("Please provide userId", 400));

    chatResponseMap.set(userId, res);

    res.write(
      `data: ${JSON.stringify({ message: "warmup", userId: userId })}\n\n`
    );

    setInterval(() => {
      res.write(
        `data: ${JSON.stringify({ message: "heartbeat", userId: userId })}\n\n`
      );
    }, 30000);

    notification.listenChatEvent().on("chat", (message: any) => {
      const recipientId: string = message.recipientId;
      const res = chatResponseMap.get(recipientId);
      if (!res) return;

      res.write(
        `data: ${JSON.stringify({
          message,
          recipientId,
        })}\n\n`
      );
      // res.write(
      //   `data: ${JSON.stringify({
      //     message: "chat",
      //     userId: message.recipientId,
      //   })}\n\n`
      // );
    });

    req.on("close", () => {
      chatResponseMap.delete(userId);
    });
  }
);

const organizeChatRecipients = (
  currentUserId: string,
  chats: TChatExtended[]
): TChatRecipient[] => {
  const recipients: TChatRecipient[] = [];

  if (!chats[0]) return recipients;

  chats.map((chat) => {
    let recipientId: string;

    // Determine the current recipientId
    if (currentUserId === chat.recipient.userId) {
      recipientId = chat.sender.userId;
    } else {
      recipientId = chat.recipient.userId;
    }

    const recipient = recipients.find((recipient) => {
      return recipientId === recipient.userId;
    });
    if (recipient) return;

    const recipientObject: TChatRecipient = {
      userId: "",
      firstName: "",
      lastName: "",
      email: "",
      gender: "male",
      role: "patient",
      imageUrl: "",
      messages: [],
    };

    const messages: TChatMessage[] = [];

    // Capture messages and user details of current recipient
    chats.map((chat) => {
      const isRecipient: boolean = recipientId === chat.recipientId;
      const isSender: boolean = recipientId === chat.senderId;

      if (isRecipient) {
        const user = chat.recipient;
        recipientObject.userId = user.userId;
        recipientObject.firstName = user.firstName;
        recipientObject.lastName = user.lastName;
        recipientObject.email = user.email;
        recipientObject.role = user.role;
        recipientObject.gender = user.gender;
        recipientObject.imageUrl = user.imageUrl;

        messages.push({
          messageId: chat.messageId,
          chatRoomId: chat.chatRoomId,
          senderId: chat.senderId,
          recipientId: chat.recipientId,
          message: chat.message,
          isRead: chat.isRead,
          isDelivered: chat.isDelivered,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        });
      }
      if (isSender) {
        const user = chat.sender;
        recipientObject.userId = user.userId;
        recipientObject.firstName = user.firstName;
        recipientObject.lastName = user.lastName;
        recipientObject.email = user.email;
        recipientObject.role = user.role;
        recipientObject.gender = user.gender;
        recipientObject.imageUrl = user.imageUrl;

        messages.push({
          messageId: chat.messageId,
          chatRoomId: chat.chatRoomId,
          senderId: chat.senderId,
          recipientId: chat.recipientId,
          message: chat.message,
          isRead: chat.isRead,
          isDelivered: chat.isDelivered,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        });
      }
    });

    recipientObject.messages = messages;
    recipients.push(recipientObject);
  });

  return recipients;
};

export const getChatRecipients = asyncHandler(async (req, res, next) => {
  const userId = req.query.userId as string;

  if (!userId) return next(new AppError("No userId is provided", 400));

  const chats = (await Chat.findMany({
    where: {
      OR: [
        { senderId: { equals: userId } },
        { recipientId: { equals: userId } },
      ],
    },
    include: {
      sender: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          gender: true,
          imageUrl: true,
        },
      },
      recipient: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          gender: true,
          imageUrl: true,
        },
      },
    },
  })) as TChatExtended[];

  const recipients: TChatRecipient[] = organizeChatRecipients(userId, chats);

  console.log("recipients===>:::", recipients);

  res.status(200).json({
    status: "success",
    message: "Recipients fetched successfully",
    data: { recipients: recipients },
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
