import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { signupSchema, loginSchema } from "../validators/auth.validator";

// ==========================================
// 🔐 SIGNUP CONTROLLER
// ==========================================
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);

    const result = await authService.signup(
      data.email,
      data.password,
      data.role,
      req.body.name
    );

    res.status(201).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🔐 LOGIN CONTROLLER
// ==========================================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("BODY:", req.body);

    const data = loginSchema.parse(req.body);

    const result = await authService.login(
      data.email,
      data.password
    );

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};