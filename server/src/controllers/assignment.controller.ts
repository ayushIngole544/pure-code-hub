import { Response, NextFunction } from "express";
import * as assignmentService from "../services/assignment.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// ==========================================
// CREATE BASIC
// ==========================================
export const createAssignment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

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

// ==========================================
// CREATE / UPDATE FULL
// ==========================================
export const createAssignmentFull = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = req.user?.userId;

    if (!teacherId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const assignment = await assignmentService.createAssignmentFull(
      req.body,
      teacherId
    );

    res.status(200).json({
      success: true,
      message: req.body.id
        ? "Assessment updated successfully"
        : "Assessment created successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLISH
// ==========================================
export const publishAssignment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignmentIdParam = req.params.id;

    // ✅ FIX TYPE ISSUE
    if (!assignmentIdParam || Array.isArray(assignmentIdParam)) {
      res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
      return;
    }

    const assignmentId = assignmentIdParam;

    const assignment =
      await assignmentService.publishAssignment(assignmentId);

    res.status(200).json({
      success: true,
      message: "Assignment published successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};