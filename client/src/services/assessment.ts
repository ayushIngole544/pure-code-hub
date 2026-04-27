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

export const getAssessmentWithQuestions = async (id: string) => {
  const res = await api.get(`/assessments/${id}`);
  return res.data;
};

// 🏆 GET LEADERBOARD
export const getLeaderboard = async (id: string) => {
  const res = await api.get(`/assessments/${id}/leaderboard`);
  return res.data;
};