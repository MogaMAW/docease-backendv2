import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const Appointment = prisma.appointment;
const AppointmentStatus = prisma.appointmentStatus;

const isApprovedAppointment = (appointmentStatusArray: any): boolean => {
  let isApproved = false;

  appointmentStatusArray.map((status: string) => {
    if (status === "approved") isApproved = true;
  });
  return isApproved;
};

export const postAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const patientId = req.body.patientId as string;
    const doctorId = req.body.doctorId as string;
    const subject = req.body.subject as string;
    const startsAt = req.body.startsAt as string;
    const endsAt = req.body.patientId as string;

    if (!patientId || !doctorId || !subject || !startsAt || !endsAt) {
      return next(new AppError("Please all mandatory fields", 400));
    }

    const newAppointment = await Appointment.create({
      data: req.body,
      select: {
        appointmentId: true,
        patientId: true,
        doctorId: true,
        subject: true,
        statuses: true,
        startsAt: true,
        endsAt: true,
        doctorsComment: true,
        patientsComment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const appointmentStatus = await AppointmentStatus.create({
      data: { appointmentId: newAppointment.appointmentId, status: "pending" },
      select: {
        appointmentStatusId: true,
        appointmentId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    newAppointment.statuses.push(appointmentStatus);

    res.status(201).json({
      status: "success",
      message: "Appointment created",
      data: { appointment: newAppointment },
    });
  }
);

export const updateAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.params.appointmentId as string;
    const patientId = req.body.patientId as string;
    const doctorId = req.body.doctorId as string;
    const subject = req.body.subject as string;
    const startsAt = req.body.startsAt as string;
    const endsAt = req.body.patientId as string;

    if (!appointmentId) {
      return next(new AppError("Please provide appointmentId", 400));
    }

    if (!patientId || !doctorId || !subject || !startsAt || !endsAt) {
      return next(new AppError("Please all mandatory fields", 400));
    }

    const savedAppointment = await Appointment.findFirst({
      where: { appointmentId: { equals: appointmentId } },
      include: { statuses: true },
    });

    if (!savedAppointment) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    if (isApprovedAppointment(savedAppointment.statuses)) {
      return next(
        new AppError("Can't update to already approved appointment", 400)
      );
    }

    const updatedAppointment = await Appointment.update({
      where: { appointmentId: appointmentId },
      data: req.body,
      select: {
        appointmentId: true,
        patientId: true,
        doctorId: true,
        subject: true,
        statuses: true,
        startsAt: true,
        endsAt: true,
        doctorsComment: true,
        patientsComment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const appointmentStatus = await AppointmentStatus.create({
      data: {
        appointmentId: updatedAppointment.appointmentId,
        status: "edited",
      },
      select: {
        appointmentStatusId: true,
        appointmentId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    updatedAppointment.statuses.push(appointmentStatus);

    res.status(200).json({
      status: "success",
      message: "Appointment updated",
      data: { appointment: updatedAppointment },
    });
  }
);

export const getAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.params.appointmentId as string;

    const appointment = await Appointment.findFirst({
      where: { appointmentId: { equals: appointmentId } },
      include: {
        statuses: { select: { status: true } },
        doctor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            gender: true,
            role: true,
            accessTokens: {
              select: { createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!appointment) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Appointment fetched",
      data: { appointment: appointment },
    });
  }
);

export const getAppointmentsByDoctor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.query.doctorId as string;

    const appointments = await Appointment.findMany({
      where: { doctorId: { equals: doctorId } },
      include: {
        statuses: { select: { status: true } },
        patient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            gender: true,
            role: true,
            accessTokens: {
              select: { createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!appointments) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Appointments fetched",
      data: { appointments: appointments },
    });
  }
);

export const getAppointmentsByPatient = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const patientId = req.query.patientId as string;

    const appointments = await Appointment.findMany({
      where: { patientId: { equals: patientId } },
      include: {
        statuses: { select: { status: true } },
        doctor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            gender: true,
            role: true,
            accessTokens: {
              select: { createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!appointments) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Appointments fetched",
      data: { appointments: appointments },
    });
  }
);

export const getAllAppointments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const patientId = req.query.patientId as string;

    const appointments = await Appointment.findMany({
      where: { patientId: { equals: patientId } },
      include: {
        statuses: { select: { status: true } },
        doctor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            gender: true,
            role: true,
            accessTokens: {
              select: { createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!appointments) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Appointments fetched",
      data: { appointments: appointments },
    });
  }
);

export const deleteAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.params.appointmentId as string;

    const appointment = await Appointment.findFirst({
      where: { appointmentId: { equals: appointmentId } },
      include: { statuses: true },
    });

    if (!appointment) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    if (isApprovedAppointment(appointment.statuses)) {
      return next(
        new AppError("Can't delete to already approved appointment", 400)
      );
    }

    await AppointmentStatus.deleteMany({
      where: { appointmentId: appointmentId },
    });

    await Appointment.delete({
      where: { appointmentId: appointmentId },
    });

    res.status(200).json({
      status: "success",
      message: "Appointments deleted",
    });
  }
);

export const rescheduleAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.params.appointmentId as string;
    const patientId = req.body.patientId as string;
    const doctorId = req.body.doctorId as string;
    const subject = req.body.subject as string;
    const startsAt = req.body.startsAt as string;
    const endsAt = req.body.patientId as string;

    if (!appointmentId) {
      return next(new AppError("Please provide appointmentId", 400));
    }

    if (!patientId || !doctorId || !subject || !startsAt || !endsAt) {
      return next(new AppError("Please all mandatory fields", 400));
    }

    const savedAppointment = await Appointment.findFirst({
      where: { appointmentId: { equals: appointmentId } },
      include: { statuses: true },
    });

    if (!savedAppointment) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    const updatedAppointment = await Appointment.update({
      where: { appointmentId: appointmentId },
      data: req.body,
      select: {
        appointmentId: true,
        patientId: true,
        doctorId: true,
        subject: true,
        statuses: true,
        startsAt: true,
        endsAt: true,
        doctorsComment: true,
        patientsComment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const SavedStatuses = await AppointmentStatus.findMany({
      where: { appointmentId: { equals: appointmentId } },
    });

    let isAppointmentRescheduled: boolean = false;
    let appointmentStatus: any;

    SavedStatuses.map((appointmentStatus) => {
      if (appointmentStatus.status === "rescheduled") {
        isAppointmentRescheduled = true;
      }
    });

    if (!isAppointmentRescheduled) {
      appointmentStatus = await AppointmentStatus.create({
        data: {
          appointmentId: updatedAppointment.appointmentId,
          status: "rescheduled",
        },
        select: {
          appointmentStatusId: true,
          appointmentId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    updatedAppointment.statuses.push(appointmentStatus);

    res.status(200).json({
      status: "success",
      message: "Appointment rescheduled",
      data: { appointment: updatedAppointment },
    });
  }
);

export const approveAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.params.appointmentId as string;

    const appointment = await Appointment.findFirst({
      where: { appointmentId: { equals: appointmentId } },
      include: { statuses: true },
    });

    if (!appointment) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    const SavedStatuses = await AppointmentStatus.findMany({
      where: { appointmentId: { equals: appointmentId } },
    });

    let isAppointmentApproved: boolean = false;
    SavedStatuses.map((appointmentStatus) => {
      if (appointmentStatus.status === "approved") {
        isAppointmentApproved = true;
      }
    });

    if (isAppointmentApproved) {
      return next(new AppError("Appointment is already approved", 400));
    }

    await AppointmentStatus.create({
      data: { appointmentId: appointmentId, status: "approved" },
    });

    res.status(200).json({
      status: "success",
      message: "Appointment approved",
    });
  }
);

export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.params.appointmentId as string;
    const doctorsComment = req.body.doctorsComment as string;

    const appointment = await Appointment.findFirst({
      where: { appointmentId: { equals: appointmentId } },
      include: { statuses: true },
    });

    if (!appointment) {
      return next(
        new AppError("We couldn't find appointment of provided Id", 404)
      );
    }

    await AppointmentStatus.updateMany({
      where: { appointmentId: appointmentId, status: "pending" },
      data: { status: "cancelled" },
    });

    if (doctorsComment) {
      await Appointment.update({
        where: { appointmentId: appointmentId },
        data: { doctorsComment: doctorsComment },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled",
    });
  }
);
