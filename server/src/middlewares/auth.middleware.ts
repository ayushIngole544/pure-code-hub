import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// =========================
// 🔐 AUTHENTICATE
// =========================
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or missing token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    // 🔥 Normalize role to uppercase ALWAYS
    req.user = {
      userId: decoded.userId,
      role: decoded.role?.toUpperCase?.() || "STUDENT",
    };

    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
    return;
  }
};

// =========================
// 🔐 AUTHORIZE ROLES (FIXED)
// =========================
export const authorizeRoles = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // 🔥 Normalize both sides
    const userRole = req.user.role.toUpperCase();
    const allowedRoles = roles.map((r) => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied for role: ${userRole}`,
      });
      return;
    }

    next();
  };
};