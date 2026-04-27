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

// ==========================================
// ❌ DELETE ASSIGNMENT
// ==========================================
export const deleteAssignment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignmentIdParam = req.params.id;

    if (!assignmentIdParam || Array.isArray(assignmentIdParam)) {
      res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
      return;
    }

    const assignment = await assignmentService.deleteAssignment(
      assignmentIdParam
    );

    res.status(200).json({
      success: true,
      message: "Assignment deleted permanently",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ⏳ EXTEND DEADLINE
// ==========================================
export const extendDeadline = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignmentId = req.params.id;

    if (!assignmentId || Array.isArray(assignmentId)) {
      res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
      return;
    }

    const { dueDate } = req.body;

    if (!dueDate) {
      res.status(400).json({
        success: false,
        message: "dueDate is required",
      });
      return;
    }

    const assignment =
      await assignmentService.extendAssignmentDeadline(
        assignmentId,
        dueDate
      );

    res.status(200).json({
      success: true,
      message: "Deadline updated successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};