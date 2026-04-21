import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔐 Ensure JWT secret exists
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// 🔐 SIGNUP SERVICE (FIXED)
// ==========================================
export const signup = async (
  email: string,
  password: string,
  roleName: "STUDENT" | "TEACHER" | "PROFESSIONAL"
) => {
  // 🔹 Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // 🔹 Find or create role
  let role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    role = await prisma.role.create({
      data: { name: roleName },
    });
  }

  // 🔹 Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔹 Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roleId: role.id,
    },
    include: {
      role: true,
    },
  });

  // 🔥 CREATE TOKEN (IMPORTANT FIX)
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role.name,
    },
    JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  // 🔹 Remove password
  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token, // 🔥 FIX
  };
};

// ==========================================
// 🔐 LOGIN SERVICE (UNCHANGED BUT CLEANED)
// ==========================================
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
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

  return {
    user: safeUser,
    token,
  };
};