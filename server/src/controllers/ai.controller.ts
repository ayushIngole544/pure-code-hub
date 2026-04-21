import { Request, Response, NextFunction } from "express";

export const generateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { topic, difficulty, type } = req.body;

    if (!topic || !difficulty || !type) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    let payload: any = {
      title: `Generated ${type} about ${topic}`,
      description: `This is a mock AI-generated description for a ${difficulty} question about ${topic}.`,
    };

    if (type === "MCQ") {
      payload.options = ["Option A", "Option B", "Option C", "Option D"];
      payload.correctAnswer = "Option B";
    } else if (type === "NAT") {
      payload.correctAnswer = "42";
    } else if (type === "CODING") {
      payload.testCases = [
        { input: "1 2", expectedOutput: "3", isHidden: false },
        { input: "4 5", expectedOutput: "9", isHidden: true },
      ];
    } else {
      res.status(400).json({ success: false, message: "Invalid question type" });
      return;
    }

    res.status(200).json({
      success: true,
      question: payload,
    });
  } catch (error) {
    next(error);
  }
};
