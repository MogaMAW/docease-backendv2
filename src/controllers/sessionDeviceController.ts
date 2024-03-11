import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SessionDevice = prisma.sessionDevice;
const TwoFA = prisma.twoFA;

export const sessionDeviceExists = async (
  userId: string,
  platform: string,
  browser: string,
  browserVersion: string
): Promise<{ exists: boolean; device: any }> => {
  const sessionDevices = await SessionDevice.findMany({
    where: { userId: { equals: userId } },
  });

  let deviceExists: boolean = false;
  let device: any = {};

  sessionDevices.map((sessionDevice) => {
    const isSamePlatform: boolean = sessionDevice.platform === platform;
    const isSameBrowser: boolean = sessionDevice.browser === browser;
    const isSameBrowserVersion: boolean =
      sessionDevice.browserVersion === browserVersion;

    if (isSamePlatform && isSameBrowser && isSameBrowserVersion) {
      deviceExists = true;
      device = sessionDevice;
      return;
    }
  });

  return { exists: deviceExists, device: device };
};

export const createSessionDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.userId as string;
    const platform = req.body.platform;
    const browser = req.body.browser;
    const browserVersion = req.body.browserVersion;

    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }

    let { exists: deviceExists, device } = await sessionDeviceExists(
      userId,
      platform,
      browser,
      browserVersion
    );

    if (!deviceExists) {
      device = await SessionDevice.create({
        data: {
          userId: userId,
          platform: platform,
          browser: browser,
          browserVersion: browserVersion,
        },
        select: {
          sessionDeviceId: true,
          userId: true,
          platform: true,
          browser: true,
          browserVersion: true,
          updatedAt: true,
          createdAt: true,
        },
      });
    }

    res.locals.device = device;
    next();
  }
);

export const getSessionDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const sessionDeviceId = req.params.sessionDeviceId as string;

    if (!sessionDeviceId) {
      return next(new AppError("Please provide sessionDeviceId", 400));
    }

    const sessionDevice = await SessionDevice.findMany({
      where: { sessionDeviceId: { equals: sessionDeviceId } },
    });

    res.status(200).json({
      status: "success",
      message: "Session device successfully fetched",
      data: { sessionDevice: sessionDevice },
    });
  }
);

export const getSessionDevicesByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }

    const sessionDevices = await SessionDevice.findMany({
      where: { userId: { equals: userId } },
    });

    const twoFA = await TwoFA.findUnique({
      where: { userId: userId },
    });

    res.status(200).json({
      status: "success",
      message: "Session devices successfully fetched",
      data: { sessionDevices: sessionDevices, twoFA: twoFA },
    });
  }
);

export const deleteSessionDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const sessionDeviceId = req.params.sessionDeviceId as string;

    if (!sessionDeviceId) {
      return next(new AppError("Please provide sessionDeviceId", 400));
    }

    const sessionDevice = await SessionDevice.findMany({
      where: { sessionDeviceId: { equals: sessionDeviceId } },
    });

    if (!sessionDevice) {
      return next(
        new AppError("We couldn't find session device of provided id", 400)
      );
    }

    await SessionDevice.delete({ where: { sessionDeviceId: sessionDeviceId } });

    res.status(200).json({
      status: "success",
      message: "Session device successfully deleted",
    });
  }
);
