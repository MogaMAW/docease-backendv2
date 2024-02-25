import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DoctorsPatient = prisma.doctorsPatient;

export const createDoctorsPatient = async (
  doctorId: string,
  patientId: string
) => {
  const doctorsPatient = await DoctorsPatient.findFirst({
    where: {
      AND: [{ doctorId: doctorId }, { patientId: patientId }],
    },
  });

  if (doctorsPatient) return;

  const newDoctorsPatient = await DoctorsPatient.create({
    data: { doctorId: doctorId, patientId: patientId },
    include: { Patient: true },
  });

  console.log("newDoctorsPatient: ", newDoctorsPatient);
};

export const getDoctorsPatients = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.query.doctorId as string;

    if (!doctorId) {
      return next(new AppError("Please provide doctorId", 400));
    }

    const patients = await DoctorsPatient.findMany({
      where: { doctorId: doctorId },
      include: {
        Patient: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            role: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
            accessTokens: {
              select: { createdAt: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Fetched patients of this doctor",
      data: { patients: patients },
    });
  }
);
