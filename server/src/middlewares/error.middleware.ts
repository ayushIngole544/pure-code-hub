import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ✅ Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues, // ✅ FIXED
    });
  }

  // ✅ Custom error
  if (err.message === "User already exists") {
    return res.status(409).json({
      success: false,
      message: err.message,
    });
  }

  // ✅ Default error
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};