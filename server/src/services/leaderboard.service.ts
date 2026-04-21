import prisma from "../config/prisma";

export const getLeaderboard = async () => {

  // 🔥 Get all ACCEPTED submissions
  const submissions = await prisma.submission.findMany({
    where: {
      status: "ACCEPTED",
    },
    include: {
      user: true,
    },
  });

  // =============================
  // 🔥 MAP: userId → Set of problems
  // =============================

  const solvedMap: Record<
    string,
    {
      userId: string;
      email: string;
      problems: Set<string>;
    }
  > = {};

  for (const sub of submissions) {
    const userId = sub.userId;

    if (!solvedMap[userId]) {
      solvedMap[userId] = {
        userId,
        email: sub.user?.email || "Unknown",
        problems: new Set(),
      };
    }

    // ✅ add unique problem
    if (sub.problemId) {
      solvedMap[userId].problems.add(sub.problemId);
    }
  }

  // =============================
  // 🔥 CONVERT TO ARRAY + SORT
  // =============================

  const leaderboard = Object.values(solvedMap)
    .map((user) => ({
      userId: user.userId,
      email: user.email,
      score: user.problems.size, // ✅ UNIQUE COUNT
    }))
    .sort((a, b) => b.score - a.score)
    .map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

  return leaderboard;
};

// ==========================================
// 🔥 ASSIGNMENT LEADERBOARD
// ==========================================
export const getAssignmentLeaderboard = async (assignmentId: string) => {
  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: { user: true },
  });

  // userId -> map of questionId -> maxScore
  const userScores: Record<
    string,
    { userId: string; email: string; scores: Record<string, number> }
  > = {};

  for (const sub of submissions) {
    const userId = sub.userId;
    if (!sub.questionId || typeof sub.score !== "number") continue;

    if (!userScores[userId]) {
      userScores[userId] = {
        userId,
        email: sub.user?.email || "Unknown",
        scores: {},
      };
    }

    const currentMax = userScores[userId].scores[sub.questionId] || 0;
    if (sub.score > currentMax) {
      userScores[userId].scores[sub.questionId] = sub.score;
    }
  }

  const leaderboard = Object.values(userScores)
    .map((user) => {
      const totalScore = Object.values(user.scores).reduce((a, b) => a + b, 0);
      return {
        userId: user.userId,
        email: user.email,
        totalScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

  return leaderboard;
};