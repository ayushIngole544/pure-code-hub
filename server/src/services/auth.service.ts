import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔐 Ensure JWT exists
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// 🔐 SIGNUP
// ==========================================
export const signup = async (
  email: string,
  password: string,
  roleName: "STUDENT" | "TEACHER" | "PROFESSIONAL",
  name?: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error: any = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  let role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    role = await prisma.role.create({
      data: { name: roleName },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      roleId: role.id,
    },
    include: { role: true },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role.name,
    },
    JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

// ==========================================
// 🔐 LOGIN (FIXED)
// ==========================================
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error: any = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role.name,
    },
    JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};