import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { Weekday } from "../types/schedule";

const prisma = new PrismaClient();
const Schedule = prisma.schedule;
const ScheduleTime = prisma.scheduleTime;

const getWeekdayNumber = (weekday: Weekday): number | null => {
  weekday.toUpperCase();
  switch (weekday) {
    case Weekday.MONDAY:
      return 1;
    case Weekday.TUESDAY:
      return 2;
    case Weekday.WEDNESDAY:
      return 3;
    case Weekday.THURSDAY:
      return 4;
    case Weekday.FRIDAY:
      return 5;
    case Weekday.SATURDAY:
      return 6;
    case Weekday.SUNDAY:
      return 7;
    default:
      return null;
  }
};

export const postSchedule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    const weekday = req.body.weekday;

    if (!userId) {
      return next(new AppError("Please provide appointmentId", 400));
    }

    if (!weekday) {
      return next(new AppError("Please provide valid weekday", 400));
    }

    const schedule = await Schedule.findFirst({
      where: { weekday: { equals: weekday } },
    });

    if (schedule) {
      return next(new AppError("weekday already has already been added", 400));
    }

    const weekdayNum = getWeekdayNumber(weekday)!;

    const newSchedule = await Schedule.create({
      data: { userId: userId, weekday: weekday, weekdayNum: weekdayNum },
      select: {
        scheduleId: true,
        userId: true,
        weekday: true,
        weekdayNum: true,
        createdAt: true,
        updatedAt: true,
        scheduleTime: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Schedule created",
      data: { schedule: newSchedule },
    });
  }
);

export const getSchedule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.params.scheduleId as string;

    const schedule = await Schedule.findMany({
      where: { scheduleId: { equals: scheduleId } },
      include: {
        scheduleTime: {
          select: {
            scheduleTimeId: true,
            start: true,
            end: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!schedule) {
      return next(
        new AppError("We couldn't find schedule of the provided Id", 404)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Schedule fetched",
      data: { schedule: schedule },
    });
  }
);

export const getSchedulesByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    const schedules = await Schedule.findMany({
      where: { userId: { equals: userId } },
      include: {
        scheduleTime: {
          select: {
            scheduleTimeId: true,
            start: true,
            end: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Schedules fetched",
      data: { schedules: schedules },
    });
  }
);

export const deleteSchedule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.params.scheduleId as string;

    const schedule = await Schedule.findFirst({
      where: { scheduleId: { equals: scheduleId } },
    });

    if (!schedule) {
      return next(
        new AppError("We couldn't find schedule of the provided userId", 404)
      );
    }

    await ScheduleTime.deleteMany({
      where: { scheduleId: scheduleId },
    });

    await Schedule.delete({
      where: { scheduleId: scheduleId },
    });

    res.status(200).json({
      status: "success",
      message: "Schedule deleted",
    });
  }
);

export const postScheduleTime = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const scheduleId = req.body.scheduleId as string;
    const start = req.body.start as string;
    const end = req.body.end as string;

    if (!scheduleId) {
      return next(new AppError("Please provide appointmentId", 400));
    }
    if (!start || !end) {
      return next(new AppError("Please provide time slots", 400));
    }

    const scheduleTime = await ScheduleTime.create({
      data: { scheduleId: scheduleId, start: start, end: end },
      select: {
        scheduleTimeId: true,
        scheduleId: true,
        start: true,
        end: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Schedule time created",
      data: { scheduleTime: scheduleTime },
    });
  }
);

export const updateScheduleTime = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const scheduleTimeId = req.body.scheduleTimeId as string;
    const start = req.body.start as string;
    const end = req.body.end as string;

    if (!scheduleTimeId) {
      return next(new AppError("Please provide appointmentId", 400));
    }
    if (!start || !end) {
      return next(new AppError("Please provide time slots", 400));
    }

    const scheduleTime = await ScheduleTime.update({
      where: { scheduleTimeId: scheduleTimeId },
      data: { start: start, end: end },
      select: {
        scheduleTimeId: true,
        scheduleId: true,
        start: true,
        end: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Schedule time update",
      data: { scheduleTime: scheduleTime },
    });
  }
);

export const deleteScheduleTime = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const scheduleTimeId = req.body.scheduleTimeId as string;

    const scheduleTime = await ScheduleTime.findFirst({
      where: { scheduleTimeId: { equals: scheduleTimeId } },
    });

    if (!scheduleTime) {
      return next(
        new AppError("We couldn't find schedule time of the provided Id", 404)
      );
    }

    await ScheduleTime.delete({
      where: { scheduleTimeId: scheduleTimeId },
    });

    res.status(200).json({
      status: "success",
      message: "Schedule time deleted",
    });
  }
);
