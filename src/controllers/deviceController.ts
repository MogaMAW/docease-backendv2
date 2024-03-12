import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const Device = prisma.device;

export const postDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    const deviceToken = req.body.deviceToken as string;
    const devicePlatform = req.body.devicePlatform as string;

    if (!userId) {
      return next(new AppError("Please provide appointmentId", 400));
    }

    if (!deviceToken || !devicePlatform) {
      return next(new AppError("Please both device token and platform", 400));
    }

    const device = await Device.findFirst({
      where: {
        deviceToken: { equals: deviceToken },
        userId: { equals: userId },
      },
    });

    if (device) {
      return next(
        new AppError("Device token already added for this account", 400)
      );
    }

    const newDevice = await Device.create({
      data: {
        userId: userId,
        deviceToken: deviceToken,
        devicePlatform: devicePlatform,
      },
      select: {
        deviceId: true,
        userId: true,
        deviceToken: true,
        devicePlatform: true,
        isDisable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Device created",
      data: { device: newDevice },
    });
  }
);

export const getDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = req.params.deviceId as string;

    const device = await Device.findMany({
      where: { deviceId: { equals: deviceId } },
    });

    if (!device) {
      return next(
        new AppError("We couldn't find device of the provided Id", 404)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Device fetched",
      data: { devices: device },
    });
  }
);

export const getDeviceByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    const devices = await Device.findMany({
      where: { userId: { equals: userId } },
    });

    res.status(200).json({
      status: "success",
      message: "Devices fetched",
      data: { devices: devices },
    });
  }
);

export const deleteDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = req.params.deviceId as string;

    const device = await Device.findFirst({
      where: { deviceId: { equals: deviceId } },
    });

    if (!device) {
      return next(
        new AppError("We couldn't find device of the provided Id", 404)
      );
    }

    await Device.deleteMany({
      where: { deviceId: deviceId },
    });

    res.status(200).json({
      status: "success",
      message: "Device deleted",
    });
  }
);

export const disableDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = req.params.deviceId as string;

    const device = await Device.findFirst({
      where: { deviceId: { equals: deviceId } },
    });

    if (!device) {
      return next(
        new AppError("We couldn't find device of the provided Id", 404)
      );
    }

    await Device.update({
      where: { deviceId: deviceId },
      data: { isDisable: true },
    });

    res.status(200).json({
      status: "success",
      message: "Device disabled",
    });
  }
);

export const enableDevice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = req.params.deviceId as string;

    const device = await Device.findFirst({
      where: { deviceId: { equals: deviceId } },
    });

    if (!device) {
      return next(
        new AppError("We couldn't find device of the provided Id", 404)
      );
    }

    await Device.update({
      where: { deviceId: deviceId },
      data: { isDisable: false },
    });

    res.status(200).json({
      status: "success",
      message: "Device disabled",
    });
  }
);
