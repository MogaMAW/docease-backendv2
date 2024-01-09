import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  console.log("ERROR", err);

  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      console.log("Is operational");
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const errorController = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendErrorProd(error, req, res);
};

export { errorController };
