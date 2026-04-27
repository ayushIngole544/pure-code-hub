import { Response, NextFunction } from "express";
import { generateAIQuestion } from "../services/ai.service";
import { validateAIResponse } from "../validators/ai.validator";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const generateQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // =========================
    // 🔍 DEBUG (VERY IMPORTANT)
    // =========================
    console.log("🔥 AI REQUEST USER:", req.user);

    const { topic, difficulty, type } = req.body;
    const userId = req.user?.userId;

    // =========================
    // 🧾 VALIDATION
    // =========================
    if (!topic || !difficulty || !type) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: topic, difficulty, type",
      });
      return;
    }

    if (!["MCQ", "NAT", "CODING"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid question type. Must be MCQ, NAT, or CODING",
      });
      return;
    }

    // =========================
    // 🤖 GENERATE AI QUESTION
    // =========================
    let question = await generateAIQuestion({
      topic,
      difficulty,
      type,
    });

    // =========================
    // 🧪 VALIDATE RESPONSE
    // =========================
    let validation = validateAIResponse(type, question);

    if (!validation.success) {
      console.warn("⚠️ AI validation failed → retrying...", validation.error);

      // retry once
      question = await generateAIQuestion({
        topic,
        difficulty,
        type,
      });

      validation = validateAIResponse(type, question);

      if (!validation.success) {
        console.error("❌ AI retry failed → using mock fallback");

        // fallback safely (same function already handles mock)
        question = await generateAIQuestion({
          topic,
          difficulty,
          type,
        });
      }
    }

    // =========================
    // 💾 STORE CODING PROBLEM
    // =========================
    let problemId: string | undefined;

    if (type === "CODING" && userId) {
      try {
        const problem = await prisma.problem.create({
          data: {
            title: question.title,
            description: question.description,
            difficulty:
              question.difficulty?.toUpperCase() ||
              difficulty.toUpperCase(),
            createdBy: userId,
          },
        });

        problemId = problem.id;

        // Save test cases
        if (question.testCases?.length) {
          await prisma.testCase.createMany({
            data: question.testCases.map((tc: any) => ({
              problemId: problem.id,
              input: tc.input,
              expectedOutput: tc.output,
              isHidden: tc.isHidden ?? false,
            })),
          });
        }
      } catch (err) {
        console.error("⚠️ DB save failed (non-fatal):", err);
      }
    }

    // =========================
    // 📤 RESPONSE
    // =========================
    res.status(200).json({
      success: true,
      question,
      problemId,
      source: process.env.OPENAI_API_KEY ? "openai" : "mock",
    });
  } catch (error) {
    console.error("🔥 AI CONTROLLER ERROR:", error);
    next(error);
  }
};