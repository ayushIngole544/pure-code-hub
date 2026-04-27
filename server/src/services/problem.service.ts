import prisma from "../config/prisma";

// 🧩 Create Problem
export const createProblem = async (
  title: string,
  description: string,
  difficulty: string,
  userId: string
) => {
  return await prisma.problem.create({
    data: {
      title,
      description,
      difficulty,
      createdBy: userId,
    },
  });
};

// 📚 Get All Problems
export const getAllProblems = async () => {
  return await prisma.problem.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

// 🔍 Get Problem by ID (with test cases)
export const getProblemById = async (id: string) => {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      testCases: {
        where: { isHidden: false },
        select: {
          id: true,
          input: true,
          expectedOutput: true,
          isHidden: true,
        },
      },
    },
  });

  if (!problem) {
    throw new Error("Problem not found");
  }

  return problem;
};