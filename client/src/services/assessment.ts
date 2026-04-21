import { api } from "./api";

export const getAssessments = async () => {
  const res = await api.get("/assignments");
  return res.data;
};

// 🧩 CREATE FULL ASSIGNMENT
export const createAssessment = async (data: any) => {
  const res = await api.post("/assignments/create-full", data);
  return res.data;
};

// 🧩 PUBLISH ASSIGNMENT
export const publishAssessment = async (id: string) => {
  const res = await api.post(`/assignments/${id}/publish`);
  return res.data;
};

export const getAssessmentWithQuestions = async (id: string) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
};

// 🏆 GET LEADERBOARD
export const getLeaderboard = async (id: string) => {
  const res = await api.get(`/assignments/${id}/leaderboard`);
  return res.data;
};