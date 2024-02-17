import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const VideoConference = prisma.videoConference;

export const getVideoConference = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const hostId = req.query.hostId as string;
    const attendeeId = req.query.attendeeId as string;

    console.log("req.query", req.query);

    if (!hostId || !attendeeId) {
      return next(new AppError("Please provide both hostId and attendId", 400));
    }

    const conference = await VideoConference.findFirst({
      where: {
        hostId: { equals: hostId },
        attendeeId: { equals: attendeeId },
      },
      include: {
        Host: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            gender: true,
            role: true,
            imageUrl: true,
          },
        },
        Attendee: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            gender: true,
            role: true,
            imageUrl: true,
          },
        },
      },
    });

    console.log("conference", conference);

    if (conference) {
      const isItLessThan30MinFromConfCreation: boolean =
        new Date(conference!.createdAt) < new Date(Date.now() + 1000 * 60 * 30);

      if (!isItLessThan30MinFromConfCreation) return;

      res.status(200).json({
        status: "success",
        message: "fetched conference",
        data: { conference: conference },
      });
      // TODO:trigger event to alert the user to enter the meeting
      // TODO:use both real time communication and push notifications
      return;
    }

    const newConference = await VideoConference.create({
      data: { hostId: hostId, attendeeId: attendeeId },
      select: {
        videoConferenceId: true,
        hostId: true,
        attendeeId: true,
        createdAt: true,
        updatedAt: true,
        Host: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            gender: true,
            role: true,
            imageUrl: true,
          },
        },
        Attendee: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            gender: true,
            role: true,
            imageUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      message: "conference created",
      data: { conference: newConference },
    });
    // TODO:trigger event to alert the user to enter the meeting
    // TODO:use both real time communication and push notifications
  }
);

//roomId is the videoConferencingId
export const videoConferencingController = (io: any) => {
  io.on("connection", (socket: any) => {
    socket.on(
      "join-room",
      (roomId: string, userPeerId: string, userId: string) => {
        socket.join(roomId);

        setTimeout(() => {
          socket.to(roomId).broadcast.emit("user-connected", userPeerId);
        }, 1000);

        socket.on("message", (message: string) => {
          io.to(roomId).emit("createMessage", message, userId);
        });
      }
    );
  });
};
