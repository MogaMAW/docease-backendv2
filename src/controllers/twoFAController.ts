import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { sessionDeviceExists } from "./sessionDeviceController";
import { RandomNumber } from "../utils/random";
import { createHash } from "crypto";
import { Email } from "../utils/email";
import { SMS } from "../utils/sms";

const prisma = new PrismaClient();
const TwoFA = prisma.twoFA;
const VerificationToken = prisma.verificationToken;

const createOrUpdateVerificationToken = async (
  userId: string
): Promise<string> => {
  const token = new RandomNumber().d6().toString();
  const hashedToken = createHash("sha256").update(token).digest("hex");

  const savedToken = await VerificationToken.findFirst({
    where: { userId: userId },
  });

  if (savedToken) {
    await VerificationToken.update({
      data: {
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      },
      where: { tokenId: savedToken.tokenId },
    });
  }

  if (!savedToken) {
    await VerificationToken.create({
      data: {
        userId: userId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      },
    });
  }

  return token;
};

export const enableTwoFAResponse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const device = res.locals.device;
    const twoFA = res.locals.TwoFA;
    const message = res.locals.message as string;

    res.status(200).json({
      status: "success",
      message: message,
      data: {
        device: device,
        twoFA: twoFA,
      },
    });
  }
);

export const enableTwoFA = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    const platform = req.body.platform as string;
    const browser = req.body.browser as string;
    const browserVersion = req.body.browserVersion as string;

    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }
    const twoFA = await TwoFA.findFirst({
      where: { userId: { equals: userId } },
    });

    if (twoFA?.isEnabled) {
      return next(
        new AppError("Two factor authentication is already turned on", 400)
      );
    }

    let newTwoFA: any = {};

    if (twoFA) {
      newTwoFA = await TwoFA.update({
        data: { isEnabled: true },
        where: { userId: userId },
        select: {
          twofaId: true,
          userId: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
          User: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              phoneNumber: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    }

    if (!twoFA) {
      newTwoFA = await TwoFA.create({
        data: { userId: userId, isEnabled: true },
        select: {
          twofaId: true,
          userId: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
          User: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              phoneNumber: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    }

    const user = newTwoFA?.User!;
    const phoneNumber = user.phoneNumber!;
    const email = user.email!;
    const token = await createOrUpdateVerificationToken(userId);
    let resMessage: string = "";
    const sendViaTelPhoneNumber: boolean = phoneNumber.startsWith("256");

    if (sendViaTelPhoneNumber) {
      const phoneNumberStartChar = phoneNumber.slice(0, 5);
      const phoneNumberEndChar = phoneNumber.slice(-2);
      resMessage = `2FA confirmation Token has been to sent tel phone ${phoneNumberStartChar}*****${phoneNumberEndChar}`;

      await new SMS(phoneNumber).send2FAConfirmationToken(token);
    }

    if (!sendViaTelPhoneNumber) {
      const emailStartChar = email.slice(0, 2);
      const emailEndChar = email.slice(-10);
      resMessage = `2FA confirmation Token has been to sent mail ${emailStartChar}******${emailEndChar}`;
      const device = `${browser} ${browserVersion} (${platform})`;

      const subject = "2FA confirmation Token";
      await new Email(user.email, subject).send2FAConfirmationToken(
        token,
        user.firstName,
        device
      );
    }

    res.locals.user = user;
    res.locals.TwoFA = newTwoFA;
    res.locals.message = resMessage;
    next();
  }
);

export const disableTwoFA = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const twofaId = req.params.twofaId as string;

    if (!twofaId) {
      return next(new AppError("Please provide twofaId", 400));
    }

    const twoFA = await TwoFA.findFirst({
      where: { twofaId: { equals: twofaId } },
    });

    if (!twoFA) {
      return next(
        new AppError("We couldn't find 2FA of the provided userId", 400)
      );
    }
    if (!twoFA.isEnabled) {
      return next(
        new AppError("2FA is already turned off for this account", 400)
      );
    }

    const updateTwoFA = await TwoFA.update({
      data: { isEnabled: false, isVerified: false },
      where: { twofaId: twofaId },
      select: {
        twofaId: true,
        userId: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Two factor authentication successfully turned off",
      data: { twoFA: updateTwoFA },
    });
  }
);

export const resendEnableTwoFA = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    const platform = req.body.platform as string;
    const browser = req.body.browser as string;
    const browserVersion = req.body.browserVersion as string;

    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }
    const twoFA = await TwoFA.findFirst({
      where: { userId: { equals: userId } },
    });

    let newTwoFA: any = {};

    if (twoFA) {
      newTwoFA = await TwoFA.update({
        data: { isEnabled: true },
        where: { userId: userId },
        select: {
          twofaId: true,
          userId: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
          User: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              phoneNumber: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    }

    if (!twoFA) {
      newTwoFA = await TwoFA.create({
        data: { userId: userId, isEnabled: true },
        select: {
          twofaId: true,
          userId: true,
          isEnabled: true,
          createdAt: true,
          updatedAt: true,
          User: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              phoneNumber: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    }

    const user = newTwoFA?.User!;
    const phoneNumber = user.phoneNumber!;
    const email = user.email!;
    const token = await createOrUpdateVerificationToken(userId);
    let resMessage: string = "";
    const sendViaTelPhoneNumber: boolean = phoneNumber.startsWith("256");

    if (sendViaTelPhoneNumber) {
      const phoneNumberStartChar = phoneNumber.slice(0, 5);
      const phoneNumberEndChar = phoneNumber.slice(-2);
      resMessage = `2FA confirmation Token has been to sent tel phone ${phoneNumberStartChar}*****${phoneNumberEndChar}`;

      await new SMS(phoneNumber).send2FAConfirmationToken(token);
    }

    if (!sendViaTelPhoneNumber) {
      const emailStartChar = email.slice(0, 2);
      const emailEndChar = email.slice(-10);
      resMessage = `2FA confirmation Token has been to sent mail ${emailStartChar}******${emailEndChar}`;
      const device = `${browser} ${browserVersion} (${platform})`;

      const subject = "2FA confirmation Token";
      await new Email(user.email, subject).send2FAConfirmationToken(
        token,
        user.firstName,
        device
      );
    }

    res.locals.user = user;
    res.locals.TwoFA = newTwoFA;
    res.locals.message = resMessage;
    next();
  }
);

export const confirm2FAToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token as string;

    if (!token) return next(new AppError("Please provide 2FA token", 400));
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const savedToken = await VerificationToken.findFirst({
      where: {
        token: { equals: hashedToken },
        expiresAt: { gt: new Date(Date.now()).toISOString() },
      },
      include: { User: true },
    });

    if (!savedToken) return next(new AppError("Invalid or expired token", 400));

    await VerificationToken.update({
      where: { tokenId: savedToken.tokenId },
      data: { expiresAt: new Date(Date.now()).toISOString() },
    });

    const userId = savedToken.User.userId;

    const updateTwoFA = await TwoFA.update({
      data: { isVerified: true },
      where: { userId: userId },
      select: {
        twofaId: true,
        userId: true,
        isEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message:
        "Two factor authentication setup for this account is completed successfully",
      data: { twoFA: updateTwoFA },
    });
  }
);

export const sendVerificationToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const userId = user.userId as string;
    const phoneNumber = user.phoneNumber as string;
    const email = user.email as string;
    const platform = req.body.platform as string;
    const browser = req.body.browser as string;
    const browserVersion = req.body.browserVersion as string;

    const { exists: deviceExists } = await sessionDeviceExists(
      userId,
      platform,
      browser,
      browserVersion
    );
    if (deviceExists) {
      next();
      return;
    }

    const token = await createOrUpdateVerificationToken(userId);
    let resMessage: string = "";
    const redirectToPath = "/2fa-verification";
    const sendViaTelPhoneNumber: boolean = phoneNumber.startsWith("256");

    if (sendViaTelPhoneNumber) {
      const phoneNumberStartChar = phoneNumber.slice(0, 5);
      const phoneNumberEndChar = phoneNumber.slice(-2);
      resMessage = `Verification Token has been sent to tel phone ${phoneNumberStartChar}*****${phoneNumberEndChar}`;

      await new SMS(phoneNumber).sendVerificationToken(token);
    }

    if (!sendViaTelPhoneNumber) {
      const emailStartChar = email.slice(0, 2);
      const emailEndChar = email.slice(-10);
      resMessage = `Verification Token sent has been to mail ${emailStartChar}******${emailEndChar}`;
      const verificationURL = `${req.protocol}://docease-v2.netlify.app/auth/2fa-verification?token=${token}`;
      const device = `${browser} ${browserVersion} (${platform})`;

      const subject = "New Device Verification Token";
      await new Email(user.email, subject).sendVerificationToken(
        token,
        verificationURL,
        device,
        user.firstName
      );
    }

    res.status(200).json({
      status: "success",
      message: resMessage,
      redirectTo: redirectToPath,
    });
  }
);

//verify device -> save it -> authenticate
export const verifyToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token as string;

    if (!token)
      return next(new AppError("Please provide the verification token", 400));
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const savedToken = await VerificationToken.findFirst({
      where: {
        token: { equals: hashedToken },
        expiresAt: { gt: new Date(Date.now()).toISOString() },
      },
      include: {
        User: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            phoneNumber: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!savedToken) return next(new AppError("Invalid or expired token", 400));

    await VerificationToken.update({
      where: { tokenId: savedToken.tokenId },
      data: { expiresAt: new Date(Date.now()).toISOString() },
    });

    res.locals.user = savedToken.User;
    next();
  }
);
