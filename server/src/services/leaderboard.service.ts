import prisma from "../config/prisma";

export const getLeaderboard = async () => {

  // 🔥 Get all submissions
  const submissions = await prisma.submission.findMany({
    include: {
      user: true,
    },
  });

  // =============================
  // 🔥 MAP: userId → stats
  // =============================
  const userStats: Record<
    string,
    {
      userId: string;
      name: string;
      email: string;
      problems: Set<string>;
      totalSubmissions: number;
      acceptedSubmissions: number;
    }
  > = {};

  for (const sub of submissions) {
    const userId = sub.userId;

    if (!userStats[userId]) {
      userStats[userId] = {
        userId,
        name: sub.user?.name || sub.user?.email?.split("@")[0] || "Unknown",
        email: sub.user?.email || "Unknown",
        problems: new Set(),
        totalSubmissions: 0,
        acceptedSubmissions: 0,
      };
    }

    userStats[userId].totalSubmissions++;

    if (sub.status === "ACCEPTED") {
      userStats[userId].acceptedSubmissions++;
      // Track unique solved problems
      if (sub.problemId) {
        userStats[userId].problems.add(sub.problemId);
      }
    }
  }

  // =============================
  // 🔥 CONVERT TO ARRAY + SORT
  // =============================
  const leaderboard = Object.values(userStats)
    .map((user) => ({
      userId: user.userId,
      name: user.name,
      email: user.email,
      score: user.problems.size,
      totalSolved: user.problems.size,
      totalSubmissions: user.totalSubmissions,
      successRate: user.totalSubmissions > 0
        ? Math.round((user.acceptedSubmissions / user.totalSubmissions) * 100)
        : 0,
    }))
    .sort((a, b) => b.score - a.score || b.successRate - a.successRate)
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