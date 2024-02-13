import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { status } from "../utils/status";
import { TStatus } from "../types/status";

const prisma = new PrismaClient();
const OnlineStatus = prisma.onlineStatus;

const createOrUpdateStatus = async (userId: string) => {
  const status = await OnlineStatus.findFirst({
    where: { userId: { equals: userId } },
  });

  if (!status) {
    await OnlineStatus.create({
      data: { userId: userId, updatedAt: new Date(Date.now()).toISOString() },
    });
    return;
  }
  await OnlineStatus.update({
    where: { userId: userId },
    data: { updatedAt: new Date(Date.now()).toISOString() },
  });
};

export const updateOnlineStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    if (!userId) {
      return next(new AppError("Please provide appointmentId", 400));
    }

    await createOrUpdateStatus(userId);

    status.emitStatusEvent({
      userId: userId,
      createdAt: new Date(Date.now()).toISOString(),
    });

    res.status(200).json({
      status: "success",
      message: "status updated",
    });
  }
);

// Broadcast user status to all connected users
export const getOnlineStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.status(200);

    const userId = res.locals.user.userId as string;
    if (!userId) return next(new AppError("Please provide userId", 400));

    res.write(
      `data: ${JSON.stringify({ message: "warmup", userId: userId })}\n\n`
    );

    setInterval(() => {
      res.write(
        `data: ${JSON.stringify({ message: "heartbeat", userId: userId })}\n\n`
      );
    }, 30000);

    status.listenStatusEvent().on("status", (statusObj: TStatus) => {
      res.write(
        `data: ${JSON.stringify({
          userId: statusObj.userId,
          createdAt: statusObj.createdAt,
        })}\n\n`
      );
    });

    req.on("close", async () => {
      await OnlineStatus.update({
        where: { userId: userId },
        data: { updatedAt: new Date(Date.now()).toISOString() },
      });
    });
  }
);

export const getOnlineUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // const users = OnlineStatus.findMany({ where: { createdAt: {} } });
    // TODO: to define logic for fetching online users
    const users = OnlineStatus.findMany();

    res.status(200).json({
      status: "success",
      message: "Users fetched",
      data: { users: users },
    });
  }
);
