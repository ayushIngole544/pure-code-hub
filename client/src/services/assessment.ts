import { api } from "./api";

export const getAssessments = async () => {
  const res = await api.get("/assessments");
  return res.data;
};

// 🧩 CREATE FULL ASSESSMENT
export const createAssessment = async (data: any) => {
  const res = await api.post("/assessments/create-full", data);
  return res.data;
};

// 🧩 PUBLISH ASSESSMENT
export const publishAssessment = async (id: string) => {
  const res = await api.post(`/assessments/${id}/publish`);
  return res.data;
};

// ❌ DELETE ASSESSMENT
export const deleteAssessment = async (id: string) => {
  const res = await api.delete(`/assessments/${id}`);
  return res.data;
};
export const getAssessmentWithQuestions = async (id: string) => {
  const res = await api.get(`/assessments/${id}`);
  return res.data;
};
export const getLeaderboardList = async () => {
  const res = await api.get("/assessments/leaderboard/list");
  return res.data;
};

export const getAssignmentLeaderboard = async (id: string) => {
  const res = await api.get(`/assessments/${id}/leaderboard`);
  return res.data;
};

// ⏳ EXTEND DEADLINE
export const extendDeadline = async (id: string, dueDate: string) => {
  const res = await api.patch(`/assessments/${id}/extend`, {
    dueDate,
  });
  return res.data;
};

// 🏆 GET LEADERBOARD
export const getLeaderboard = async (id: string) => {
  const res = await api.get(`/assessments/${id}/leaderboard`);
  return res.data;
};
