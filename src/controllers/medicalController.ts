import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { Upload } from "../utils/upload";
import { RandomNumber } from "../utils/random";

const prisma = new PrismaClient();
const MedicalFile = prisma.medicalFile;
const MedicalRecord = prisma.medicalRecord;

export const postMedicalRecord = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    const healthStatus = req.body.healthStatus as string;
    const medication = req.body.medication as string;
    const illness = req.body.illness as string;
    const diet = req.body.diet as string;

    console.log("req.body", req.body);

    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }

    if (!healthStatus || !medication || !illness || !diet) {
      return next(new AppError("Please fill all fields", 400));
    }

    const newMedicalRecord = await MedicalRecord.create({
      data: {
        userId: userId,
        healthStatus: healthStatus,
        medication: medication,
        illness: illness,
        diet: diet,
      },
      select: {
        medicalRecordId: true,
        userId: true,
        healthStatus: true,
        medication: true,
        illness: true,
        diet: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Record created successfully",
      data: { medicalRecord: newMedicalRecord },
    });
  }
);

export const getMedicalRecordByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    if (!userId) return next(new AppError("Please provide userId", 400));

    const medicalRecords = await MedicalRecord.findMany({
      where: { userId: { equals: userId } },
    });

    res.status(200).json({
      status: "success",
      message: "Medical records fetched",
      data: { medicalRecords: medicalRecords },
    });
  }
);

export const deleteMedicalRecord = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const medicalRecordId = req.params.medicalRecordId as string;

    if (!medicalRecordId)
      return next(new AppError("Please provide medicalRecordId", 400));

    await MedicalRecord.delete({
      where: { medicalRecordId: medicalRecordId },
    });

    res.status(200).json({
      status: "success",
      message: "Medical records deleted",
    });
  }
);

export const postMedicalRecordFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const userId = req.body.userId;
    if (!userId) return next(new AppError("Please provide userId", 400));
    if (file == undefined) {
      return next(new AppError("Please provide an image", 400));
    }

    const filename = file.originalname;

    const filePath = `medical-files/${new RandomNumber().d4()}_${
      file.originalname
    }`;
    const upload = await new Upload(filePath, next).add(file);
    const url = upload?.url as string;

    const newMedicalFile = await MedicalFile.create({
      data: { userId: userId, name: filename, path: filePath, url: url },
      select: {
        medicalFileId: true,
        userId: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: `File uploaded successfully`,
      data: { medicalFile: newMedicalFile },
    });
  }
);

export const getMedicalRecordFileByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    if (!userId) return next(new AppError("Please provide userId", 400));

    const medicalRecords = await MedicalFile.findMany({
      where: { userId: { equals: userId } },
    });

    res.status(200).json({
      status: "success",
      message: "Medical files fetched",
      data: { medicalRecords: medicalRecords },
    });
  }
);

export const deleteMedicalRecordFile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const medicalFileId = req.params.medicalFileId as string;

    if (!medicalFileId)
      return next(new AppError("Please provide medicalFileId", 400));

    const medicalFile = await MedicalFile.findFirst({
      where: { medicalFileId: medicalFileId },
    });

    if (!medicalFile) {
      return next(
        new AppError("We couldn't find medical file of the provided Id", 404)
      );
    }

    await MedicalFile.delete({
      where: { medicalFileId: medicalFileId },
    });

    res.status(200).json({
      status: "success",
      message: "File deleted",
    });
  }
);
