import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { signupSchema, loginSchema } from "../validators/auth.validator";

// 🔐 Signup Controller
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);

    // 🔥 FIX: get token also
    const result = await authService.signup(
      data.email,
      data.password,
      data.role
    );

    res.status(201).json({
      success: true,
      token: result.token, // 🔥 IMPORTANT
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// 🔐 Login Controller
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