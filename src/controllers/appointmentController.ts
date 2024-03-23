import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import {
  AppointmentStatusObject as StatusObject,
  TAppointmentStatus,
} from "../types/appointment";
import { notification } from "../utils/notification";
import { TPushNotificationTitleEnum } from "../types/notification";
import { createDoctorsPatient } from "./doctorsPatientController";

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

const appointmentStatusObject = (
  statusArray: TAppointmentStatus[]
): StatusObject => {
  const status: StatusObject = {
    pending: "",
    rescheduled: "",
    edited: "",
    approved: "",
    cancelled: "",
    done: "",
  };

  statusArray.map((appointmentStatus: TAppointmentStatus) => {
    if (appointmentStatus.status === "pending") {
      status.pending = "pending";
    }
    if (appointmentStatus.status === "rescheduled") {
      status.rescheduled = "rescheduled";
    }
    if (appointmentStatus.status === "edited") {
      status.edited = "edited";
    }
    if (appointmentStatus.status === "approved") {
      status.approved = "approved";
    }
    if (appointmentStatus.status === "cancelled") {
      status.cancelled = "cancelled";
    }
    if (appointmentStatus.status === "done") {
      status.done = "done";
    }
  });

  return status;
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

    await createDoctorsPatient(doctorId, patientId);

    newAppointment.statuses.push(appointmentStatus);

    // Emit notification event
    notification.emitNotificationEvent({
      userId: doctorId,
      message: "New appointment from patient",
      title: TPushNotificationTitleEnum.APPOINTMENT,
      body: "New appointment from patient",
      link: `/appointments?id=${newAppointment.appointmentId}`,
    });

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
    // Emit notification event
    notification.emitNotificationEvent({
      userId: doctorId,
      message: "Patient has edited appointment schedule",
      title: TPushNotificationTitleEnum.APPOINTMENT,
      body: "Patient has edited appointment schedule",
      link: `/appointments?id=${updatedAppointment.appointmentId}`,
    });

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

    console.log("req.body", req.body);

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

    const SavedStatuses: any = await AppointmentStatus.findMany({
      where: { appointmentId: { equals: appointmentId } },
    });

    const statusObj = appointmentStatusObject(SavedStatuses);

    if (statusObj.cancelled) {
      await AppointmentStatus.updateMany({
        where: { appointmentId: appointmentId, status: "cancelled" },
        data: { status: "pending" },
      });
    }

    let appointmentStatus: any;

    if (!statusObj.rescheduled) {
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
    // Emit notification event
    notification.emitNotificationEvent({
      userId: patientId,
      message: "Doctor has rescheduled your appointment",
      title: TPushNotificationTitleEnum.APPOINTMENT,
      body: "Doctor has rescheduled your appointment",
      link: `/appointments?id=${updatedAppointment.appointmentId}`,
    });

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

    const SavedStatuses: any = await AppointmentStatus.findMany({
      where: { appointmentId: { equals: appointmentId } },
    });

    const statusObj = appointmentStatusObject(SavedStatuses);

    if (statusObj.approved) {
      return next(new AppError("Appointment is already approved", 400));
    }

    if (statusObj.cancelled) {
      return next(new AppError("Can't approve cancelled appointment", 400));
    }

    const isExpired = new Date(Date.now()) > new Date(appointment.endsAt);
    if (isExpired) {
      return next(new AppError("Can't approve  missed appointment", 400));
    }

    await AppointmentStatus.create({
      data: { appointmentId: appointmentId, status: "approved" },
    });

    // Emit notification event
    notification.emitNotificationEvent({
      userId: appointment.patientId,
      message: "Doctor has approved your appointment",
      title: TPushNotificationTitleEnum.APPOINTMENT,
      body: "Doctor has approved your appointment",
      link: `/appointments?id=${appointment.appointmentId}`,
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

    const SavedStatuses: any = await AppointmentStatus.findMany({
      where: { appointmentId: { equals: appointmentId } },
    });

    const statusObj = appointmentStatusObject(SavedStatuses);

    if (statusObj.cancelled) {
      return next(new AppError("Appointment is already cancelled ", 400));
    }

    await AppointmentStatus.deleteMany({
      where: {
        OR: [
          {
            appointmentId: { equals: appointmentId },
            status: { equals: "pending" },
          },
          {
            appointmentId: { equals: appointmentId },
            status: { equals: "approved" },
          },
        ],
      },
    });

    await AppointmentStatus.create({
      data: { appointmentId: appointmentId, status: "cancelled" },
    });

    if (doctorsComment) {
      await Appointment.update({
        where: { appointmentId: appointmentId },
        data: { doctorsComment: doctorsComment },
      });
    }

    // Emit notification event
    notification.emitNotificationEvent({
      userId: appointment.patientId,
      message: "Doctor has cancelled your appointment",
      title: TPushNotificationTitleEnum.APPOINTMENT,
      body: "Doctor has cancelled your appointment",
      link: `/appointments?id=${appointment.appointmentId}`,
    });

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled",
    });
  }
);
