import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const getActiveStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      message: "App is active",
    });
  }
);
