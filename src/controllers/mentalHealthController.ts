import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const MentalHealth = prisma.mentalHealth;

const makeAIAssessment = async (content: string) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: content }],
    model: "gpt-3.5-turbo",
  });

  console.log("chatCompletion->", chatCompletion);

  return chatCompletion.choices[0].message;
};

export const postMentalHealthAssessment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId as string;
    const answeredQuestions = req.body.answeredQuestions;
    const parsedAnsweredQuestions = JSON.parse(answeredQuestions);
    if (!userId) {
      return next(new AppError("Please provide userId", 400));
    }
    const isValidQtnLength = parsedAnsweredQuestions.length >= 5;

    if (!isValidQtnLength) {
      return next(new AppError("Please answer at least 5 questions", 400));
    }
    const promptContent = `For mental health assessment that I took,these 
                           are questions I answered. Questions: ${answeredQuestions}. 
                           They are provided as stringified json and property "option" represents 
                           an answer for the question. So basing the questions and their answers,
                           Please provide a compressive summary advising me of about 80 words`;

    const aiResponse = await makeAIAssessment(promptContent);
    const aiResponseContent = (await makeAIAssessment(promptContent))
      .content as string;

    console.log("aiResponse", aiResponse);

    const newMentalHealthAssessment = await MentalHealth.create({
      data: {
        userId: userId,
        answeredQuestions: parsedAnsweredQuestions,
        aiResponse: aiResponseContent,
      },
      select: {
        mentalHealthId: true,
        userId: true,
        answeredQuestions: true,
        aiResponse: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Assessment summary created successfully",
      data: { mentalHealth: newMentalHealthAssessment },
    });
  }
);

export const getMentalHealthAssessment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const mentalHealthId = req.params.mentalHealthId as string;

    if (!mentalHealthId)
      return next(new AppError("Please provide mentalHealthId", 400));

    const mentalHealthAssessment = await MentalHealth.findFirst({
      where: { mentalHealthId: { equals: mentalHealthId } },
    });

    res.status(200).json({
      status: "success",
      message: "Mental health assessment fetched",
      data: { mentalHealth: mentalHealthAssessment },
    });
  }
);

export const getMentalHealthAssessmentsByUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string;

    if (!userId) return next(new AppError("Please provide userId", 400));

    const mentalHealthAssessments = await MentalHealth.findMany({
      where: { userId: { equals: userId } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      message: "Mental health assessments fetched",
      data: { mentalHealth: mentalHealthAssessments },
    });
  }
);
