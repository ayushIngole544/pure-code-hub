import * as assignmentService from "../services/assignment.service";
import { Request, Response, NextFunction } from "express";

export const createAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = (req as any).user.userId;

    const assignment = await assignmentService.createAssignment(
      req.body,
      teacherId
    );

    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const createAssignmentFull = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = (req as any).user.userId;

    const assignment = await assignmentService.createAssignmentFull(
      req.body,
      teacherId
    );

    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const publishAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignmentId = req.params.id as string;
    const assignment = await assignmentService.publishAssignment(assignmentId);

    res.status(200).json({
      success: true,
      message: "Assignment published successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};