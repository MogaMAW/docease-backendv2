import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { notification } from "../utils/notification";
import { PrismaClient } from "@prisma/client";
import { TConfNotification, TNotification } from "../types/notification";

const prisma = new PrismaClient();
const Notification = prisma.notification;
const Device = prisma.device;
const User = prisma.user;

// Saves notification in db and returns its id and createdAt
const saveNotification = (notificationMsg: TNotification) => {
  let notificationId: string = "";
  let createdAt: Date = new Date();

  const saveNotificationInDb = async () => {
    const notification = await Notification.create({
      data: {
        userId: notificationMsg.userId,
        message: notificationMsg.message,
        link: notificationMsg.link,
      },
      select: { notificationId: true, createdAt: true },
    });

    notificationId = notification.notificationId;
    createdAt = notification.createdAt;
  };
  saveNotificationInDb();

  return { notificationId: notificationId, createdAt: createdAt };
};

const clientResponseMap = new Map<string, Response>();

const sendSSENotificationToOneClient = async (
  userId: string,
  message: string,
  notificationId: string,
  createdAt: Date,
  link: string
) => {
  const res = clientResponseMap.get(userId);
  if (!res) return;

  res.write(
    `data: ${JSON.stringify({
      notificationId,
      createdAt,
      link,
      message,
      userId,
    })}\n\n`
  );
};

const sendPushNotification = async (notificationMsg: TNotification) => {
  // TODO: to add logic of only sending push notification when user is offline
  if (!notificationMsg.userId) return;
  const devices = await Device.findMany({
    where: { userId: notificationMsg.userId },
  });
  if (!devices[0]) return;

  devices.map(async (device) => {
    if (device.isDisable) return;

    await notification.sendPushNotification({
      userId: notificationMsg.userId,
      message: notificationMsg.message,
      deviceToken: device.deviceToken,
      title: notificationMsg.title,
      body: notificationMsg.body,
    });
  });
};

export const getLiveNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.status(200);

    const userId = res.locals.user.userId as string;
    if (!userId) return next(new AppError("Please provide userId", 400));

    clientResponseMap.set(userId, res);

    res.write(
      `data: ${JSON.stringify({ message: "warmup", userId: userId })}\n\n`
    );

    setInterval(() => {
      res.write(
        `data: ${JSON.stringify({ message: "heartbeat", userId: userId })}\n\n`
      );
    }, 30000);

    notification
      .listenNotificationEvent()
      .on("notification", (notificationMsg: TNotification) => {
        const { notificationId, createdAt } = saveNotification(notificationMsg);

        if (notificationMsg.userId !== userId) return;
        sendSSENotificationToOneClient(
          notificationMsg.userId,
          notificationMsg.message,
          notificationId,
          createdAt,
          notificationMsg.link!
        );

        //sending push notification
        sendPushNotification(notificationMsg);
      });

    req.on("close", () => {
      clientResponseMap.delete(userId);
    });
  }
);

const sendSSEConfNotificationToClient = async (
  userId: string,
  videoConferenceId: string
) => {
  const res = clientResponseMap.get(userId);
  if (!res) return;
  const user = await User.findFirst({ where: { userId: userId } });
  if (!user) return;

  const isDoctor: boolean = user.role === "doctor";

  const message = `Please join a call with ${
    isDoctor ? "Dr." : "patient, " + user.firstName + " " + user.lastName
  }`;

  res.write(
    `data: ${JSON.stringify({ message, userId, videoConferenceId })}\n\n`
  );
};

const sendPeerIdToClient = async (
  userId: string,
  videoConferenceId: string,
  peerId: string,
  message: string
) => {
  const res = clientResponseMap.get(userId);
  if (!res) return;

  res.write(
    `data: ${JSON.stringify({
      message,
      userId,
      peerId,
      videoConferenceId,
    })}\n\n`
  );
};

export const getLiveConferenceNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.status(200);

    const userId = res.locals.user.userId as string;
    if (!userId) return next(new AppError("Please provide userId", 400));

    clientResponseMap.set(userId, res);

    res.write(
      `data: ${JSON.stringify({ message: "warmup", userId: userId })}\n\n`
    );

    setInterval(() => {
      res.write(
        `data: ${JSON.stringify({ message: "heartbeat", userId: userId })}\n\n`
      );
    }, 30000);

    notification
      .listenConfNotificationEvent()
      .on("conferenceNotification", (notificationMsg: TConfNotification) => {
        if (notificationMsg.message === "confconnected") {
          sendPeerIdToClient(
            notificationMsg.userId,
            notificationMsg.videoConferenceId,
            notificationMsg.peerId!,
            notificationMsg.message
          );
          return;
        }
        if (notificationMsg.userId !== userId) return;
        sendSSEConfNotificationToClient(
          notificationMsg.userId,
          notificationMsg.videoConferenceId!
        );

        // TODO: to send a push notification
      });

    req.on("close", () => {
      clientResponseMap.delete(userId);
    });
  }
);

export const getNotificationsByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    if (!userId) return next(new AppError("Please provide userId", 400));

    const notifications = await Notification.findMany({
      where: { userId: { equals: userId } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      message: "Notifications fetched successfully",
      data: { notifications: notifications },
    });
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const notificationId = req.params.notificationId as string;

    if (!notificationId)
      return next(new AppError("Please provide notificationId", 400));

    const updatedNotification = await Notification.update({
      where: { notificationId: notificationId },
      data: { isRead: true },
      select: {
        notificationId: true,
        userId: true,
        message: true,
        link: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
      data: { notification: updatedNotification },
    });
  }
);
