import { Request, Response, NextFunction } from "express";
import * as problemService from "../services/problem.service";
import { createProblemSchema } from "../validators/problem.validator";

// 🧩 Create Problem
export const createProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ✅ Zod validation (NEW)
    const data = createProblemSchema.parse(req.body);

    // user added by auth middleware
    const userId = (req as any).user.userId;

    const problem = await problemService.createProblem(
      data.title,
      data.description,
      data.difficulty,
      userId
    );

    res.status(201).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

// 📚 Get All Problems
export const getAllProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problems = await problemService.getAllProblems();

    res.status(200).json({
      success: true,
      problems,
    });
  } catch (error) {
    next(error);
  }
};

// 🔍 Get Problem by ID
export const getProblemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ✅ FIXED type issue
    const id = String(req.params.id);

    const problem = await problemService.getProblemById(id);

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};