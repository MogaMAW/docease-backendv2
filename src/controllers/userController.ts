import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { randomBytes, createHash } from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { hash, compare, genSalt } from "bcryptjs";
import { Upload } from "../utils/upload";
import { Email } from "../utils/email";
import mime from "mime-types";
import { Gender } from "../types/gender";

const prisma = new PrismaClient();
const User = prisma.user;

const signAccessToken = (userId: number) => {
  const jwtSecret = process.env.JWT_SECRET!;
  return jwt.sign({ userId: userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN_HOURS,
  });
};

const authenticate = async (
  user: any,
  statusCode: number,
  res: Response
): Promise<void> => {
  const accessToken = signAccessToken(user.userId);
  const JWT_EXPIRES_IN: number = parseInt(process.env.JWT_EXPIRES_IN_HOURS!);
  const expirationTime = new Date(Date.now() + JWT_EXPIRES_IN * 60 * 60 * 1000);
  const expiresIn = JWT_EXPIRES_IN * 60 * 60 * 1000;

  user.imagePath = undefined;
  user.password = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  user.createdAt = undefined;
  user.updatedAt = undefined;

  res.status(statusCode).json({
    status: "success",
    accessToken: accessToken,
    expiresIn: expiresIn,
    expirationTime: expirationTime,
    user: user,
  });
};

const validateGender = (gender: string): boolean => {
  const isMale = gender === Gender.MALE;
  const isFemale = gender === Gender.FEMALE;

  if (isMale || isFemale) {
    return true;
  }
  return false;
};

export const setUserRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const PATIENT_SIGNUP_URL = "/patients/signup";
    const DOCTOR_SIGNUP_URL = "/doctors/signup";
    const DOCTOR_ADMIN_URL = "/admins/signup";

    if (req.url === PATIENT_SIGNUP_URL) {
      res.locals.role = "patient";
    } else if (req.url === DOCTOR_SIGNUP_URL) {
      res.locals.role = "doctor";
    } else if (req.url === DOCTOR_ADMIN_URL) {
      res.locals.role = "admin";
    } else {
      return next(new AppError("Invalid signup url", 400));
    }

    next();
  }
);

export const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    const phone = req.body.phoneNumber as string;
    const email = req.body.email as string;
    const gender = req.body.gender as string;
    const password = req.body.password as string;
    const role = res.locals.role as string;

    if (!email || !phone || !firstName || !lastName || !password || !gender) {
      return next(new AppError("Please fill out all fields", 400));
    }
    if (!email.includes("@")) {
      return next(new AppError("Please provide a valid email", 400));
    }
    if (!validateGender(gender)) {
      return next(new AppError("Please provide a valid gender", 400));
    }
    if (!role) {
      return next(new AppError("Please ensure user role is set!", 400));
    }
    const user = await User.findFirst({
      where: { email: { equals: email } },
    });
    if (user) return next(new AppError("Email already taken", 400));

    const salt = await genSalt(10);
    req.body.password = await hash(req.body.password, salt);
    req.body.role = role;

    const newUser = await User.create({
      data: req.body,
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        imageUrl: true,
      },
    });

    authenticate(newUser, 201, res);
  }
);

export const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email as string;
    const password = req.body.password as string;

    if (!email || !password) {
      return next(new AppError("Missing email or password", 400));
    }
    const user = await User.findFirst({
      where: { email: { equals: email } },
    });

    if (!user || !(await compare(password, user.password))) {
      return next(new AppError("Wrong email or password", 400));
    }
    authenticate(user, 200, res);
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email as string;

    if (!email) {
      return next(new AppError("Please provide your email", 400));
    }
    const user = await User.findFirst({
      where: { email: { equals: email } },
    });

    if (!user) {
      return next(new AppError("There is no user with provided email", 404));
    }

    const resetToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    await User.update({
      where: { userId: user.userId },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: new Date(
          Date.now() + 1000 * 60 * 20
        ).toISOString(),
      },
    });

    const resetURL = `${req.protocol}://docease-v2.netlify.app/auth/reset-password/${resetToken}`;
    // const resetURL = `${req.protocol}://localhost:5173/auth/reset-password/${resetToken}`;
    console.log("resetURL", resetURL);
    const subject = "Reset Password";
    await new Email(email, subject).sendPasswordReset(resetURL, user.firstName);

    res.status(200).json({
      status: "success",
      message: `Password reset token sent to ${email}`,
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.password as string;
    const token = req.params.token;

    if (!token) return next(new AppError("Please provide a reset token", 400));
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const user = await User.findFirst({
      where: {
        passwordResetToken: { equals: hashedToken },
        passwordResetExpiresAt: { gt: new Date(Date.now()).toISOString() },
      },
    });

    if (!user) return next(new AppError("Invalid or expired token", 400));

    if (!newPassword) {
      return next(new AppError("Please provide your new password", 400));
    }

    const salt = await genSalt(10);
    user.password = await hash(req.body.password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;

    await User.update({
      where: { userId: user.userId },
      data: user,
    });

    authenticate(user, 200, res);
  }
);

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    let token;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access", 401)
      );
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const user = await User.findFirst({
      where: { userId: { equals: userId } },
    });

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exist!", 403)
      );
    }

    res.locals.user = user;
    next();
  }
);

export const protectDoctor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    let token;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access", 400)
      );
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const user = await User.findFirst({
      where: { userId: { equals: userId } },
    });

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exist!", 403)
      );
    }
    if (user.role !== "doctor") {
      return next(
        new AppError("Not authorized to perform this operation!", 401)
      );
    }
    res.locals.user = user;
    next();
  }
);

export const editUserDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId as string;
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    const gender = req.body.gender as string;
    const email = req.body.email as string;
    const phone = req.body.phoneNumber as string;

    if (!firstName) return next(new AppError("Please provide first name", 400));
    if (!lastName) return next(new AppError("Please provide last name", 400));
    if (!gender) return next(new AppError("Please provide gender", 400));
    if (!email) return next(new AppError("Please provide email", 400));
    if (!phone) return next(new AppError("Please provide phone number", 400));

    const user = await User.findFirst({
      where: { userId: { equals: userId } },
    });
    if (!user) {
      return next(new AppError("we couldn't find user with userId", 404));
    }
    if (!email.includes("@")) {
      return next(new AppError("Please provide a valid email", 400));
    }
    if (!validateGender(gender)) {
      return next(new AppError("Please provide a valid gender", 400));
    }

    if (user.email !== email) {
      const savedUser = await User.findFirst({
        where: { email: { equals: email } },
      });
      if (savedUser) {
        return next(
          new AppError("Can't update to already registered email", 400)
        );
      }
    }

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.gender = req.body.gender;
    user.email = req.body.email;
    user.phoneNumber = req.body.phoneNumber;

    await User.update({
      where: { userId: user.userId },
      data: user,
    });

    res.status(200).json({
      status: "success",
      message: "User details edited successfully",
    });
  }
);

export const updateUserImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const userId = req.params.userId;
    if (!userId) return next(new AppError("Please provide userId", 400));
    if (file == undefined) {
      return next(new AppError("Please provide an image", 400));
    }

    const mimeType = mime.lookup(file.originalname);
    const isImage = mimeType && mimeType.startsWith("image");
    if (!isImage) {
      return next(new AppError("Please provide file of image type", 400));
    }

    const user = await User.findFirst({
      where: { userId: { equals: userId } },
    });
    if (!user) {
      return next(
        new AppError(`We couldn't find user with provided userId`, 404)
      );
    }

    const imagePath = `users/${Date.now()}_${file.originalname}`;
    const upload = await new Upload(imagePath, next).add(file);
    const url = upload?.url;

    if (url && user) user.imageUrl = url;
    user.imagePath = imagePath;

    await User.update({
      where: { userId: userId },
      data: user,
    });

    res.status(200).json({
      status: "success",
      message: `Image uploaded successfully`,
      data: { imageUrl: url },
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const currentPassword = req.body.currentPassword as string;
    const newPassword = req.body.newPassword as string;

    if (!userId) {
      return next(new AppError("Please provide  userId", 400));
    }

    const user = await User.findFirst({
      where: { userId: { equals: userId } },
    });
    if (!user) {
      return next(
        new AppError(`We couldn't find user with provided userId`, 404)
      );
    }

    if (!(await compare(currentPassword, user.password))) {
      return next(new AppError("wrong current password", 403));
    }

    if (await compare(newPassword, user.password)) {
      return next(new AppError("New password same as current password", 403));
    }
    const salt = await genSalt(10);
    user.password = await hash(newPassword, salt);

    await User.update({
      where: { userId: user.userId },
      data: user,
    });

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  }
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }

    const user = await User.findFirst({
      where: { userId: { equals: userId } },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return next(new AppError("we couldn't find user with userId", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: { user: user },
    });
  }
);
