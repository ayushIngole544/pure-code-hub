import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { SubmissionStatus } from "@prisma/client";
import { submissionQueue } from "../queues/submission.queue";

// ==========================================
// 🔹 Normalize language
// ==========================================
const normalizeLanguage = (lang: string): string => {
  const l = lang.toLowerCase().trim();

  if (l === "c++") return "cpp";
  if (l === "js") return "javascript";
  if (l === "py") return "python";

  return l;
};

// ==========================================
// 🔹 Validate supported languages
// ==========================================
const isSupportedLanguage = (lang: string): boolean => {
  return ["python", "javascript", "cpp", "c", "java"].includes(lang);
};

// ==========================================
// 🔥 SUBMIT QUESTION (MCQ, NAT, CODING)
// ==========================================
export const submitQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId, questionId, answer, code, language } = req.body;
    const userId = req.user?.userId;

    if (!userId || !assignmentId || !questionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🔍 Check assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // ⏰ Deadline check
    if (new Date() > assignment.dueDate) {
      return res.status(403).json({
        success: false,
        message: "Deadline has passed",
      });
    }

    // 🔍 Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    let calculatedScore = 0;
    let status: SubmissionStatus = SubmissionStatus.PENDING;

    // ==========================================
    // 🔴 CODING QUESTION
    // ==========================================
    if (question.type === "CODING") {
      if (!code || !language || !question.problemId) {
        return res.status(400).json({
          success: false,
          message: "Missing coding fields",
        });
      }

      const normalizedLanguage = normalizeLanguage(language);

      if (!isSupportedLanguage(normalizedLanguage)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported language",
        });
      }

      const submission = await prisma.submission.create({
        data: {
          userId,
          problemId: question.problemId,
          assignmentId,
          questionId,
          code,
          language: normalizedLanguage,
          status: SubmissionStatus.PENDING,
          score: 0,
        },
      });

      // 🔥 Queue execution
      await submissionQueue.add("process-submission", {
        submissionId: submission.id,
        problemId: question.problemId,
        code,
        language: normalizedLanguage,
      });

      return res.status(200).json({
        success: true,
        message: "Coding submission queued",
        submissionId: submission.id,
      });
    }

    // ==========================================
    // 🔴 MCQ / NAT
    // ==========================================
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    // 🔹 MCQ
    if (question.type === "MCQ") {
      if (question.correctAnswer === answer) {
        calculatedScore = question.marks;
        status = SubmissionStatus.ACCEPTED;
      } else {
        status = SubmissionStatus.WRONG_ANSWER;
      }
    }

    // 🔹 NAT
    else if (question.type === "NAT") {
      const normalizedAnswer = String(answer).trim().toLowerCase();
      const normalizedCorrect = String(question.correctAnswer)
        .trim()
        .toLowerCase();

      if (normalizedAnswer === normalizedCorrect) {
        calculatedScore = question.marks;
        status = SubmissionStatus.ACCEPTED;
      } else {
        status = SubmissionStatus.WRONG_ANSWER;
      }
    }

    // ==========================================
    // 🔥 CREATE SUBMISSION
    // ==========================================
    const submission = await prisma.submission.create({
      data: {
        userId,
        assignmentId,
        questionId,
        answer,
        status,
        score: calculatedScore,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Submitted successfully",
      submissionId: submission.id,
      score: calculatedScore,
      status,
    });

  } catch (error: any) {
    console.error("Submission Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Submission failed",
    });
  }
};

// ==========================================
// 🔥 GET ALL SUBMISSIONS
// ==========================================
export const getAllSubmissions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      submissions,
    });

  } catch (error: any) {
    console.error("Get submissions error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch submissions",
    });
  }
};

// ==========================================
// 🔥 GET SUBMISSION BY ID
// ==========================================
export const getSubmissionById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: idParam },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });

  } catch (error: any) {
    console.error("Get submission error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Fetch failed",
    });
  }
};