import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { SubmissionStatus } from "@prisma/client";
import { evaluateSubmission } from "../services/evaluation.service";

// ==========================================
// 🔥 SUBMIT FULL ASSESSMENT
// ==========================================
export const submitQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId, answers = {}, codes = {}, language } = req.body;
    const userId = req.user?.userId;

    if (!userId || !assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 🔒 SOLVE ONLY ONCE
    const alreadySubmitted = await prisma.submission.findFirst({
      where: { userId, assignmentId },
    });

    if (alreadySubmitted) {
      return res.status(403).json({
        success: false,
        message: "You have already submitted this assessment",
      });
    }

    // ⏰ DEADLINE CHECK
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (new Date() > assignment.dueDate) {
      return res.status(403).json({
        success: false,
        message: "Deadline has passed",
      });
    }

    // 🔥 CREATE BASE SUBMISSION
    const submission = await prisma.submission.create({
      data: {
        userId,
        assignmentId,
        status: SubmissionStatus.PENDING,
        score: 0,
      },
    });

    const questions = await prisma.question.findMany({
      where: { assignmentId },
    });

    let totalScore = 0;

    for (const q of questions) {
      // MCQ
      if (q.type === "MCQ") {
        const ans = answers[q.id];
        if (ans && ans === q.correctAnswer) {
          totalScore += q.marks;
        }
      }

      // NAT
      if (q.type === "NAT") {
        const ans = answers[q.id];
        if (
          ans &&
          String(ans).trim().toLowerCase() ===
            String(q.correctAnswer).trim().toLowerCase()
        ) {
          totalScore += q.marks;
        }
      }

      // CODING
      if (q.type === "CODING" && q.problemId) {
        const code = codes[q.id];
        if (!code) continue;

        const result = await evaluateSubmission(
          submission.id,
          q.problemId,
          code,
          language || "javascript"
        );

        totalScore += result.score;
      }
    }

    // FINAL UPDATE
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.ACCEPTED,
        score: totalScore,
        answer: JSON.stringify({ answers, codes }),
      },
    });

    return res.status(200).json({
      success: true,
      score: totalScore,
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 🔥 SUBMIT SINGLE PROBLEM (CODE EDITOR)
// ==========================================
export const submitProblem = async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message: "Missing problemId or code",
      });
    }

    const result = await evaluateSubmission(
      "temp-problem",
      problemId,
      code,
      language || "javascript"
    );

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    const submissions = await prisma.submission.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      submissions,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 🔥 GET SINGLE SUBMISSION
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

const submission = await prisma.submission.findUnique({
  where: { id: idParam },
});

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};