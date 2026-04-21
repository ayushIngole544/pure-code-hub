import { api } from "./api";

export type AIRequest = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "MCQ" | "NAT" | "CODING";
};

export const generateAIQuestion = async (data: AIRequest) => {
  const res = await api.post("/ai/generate-question", data);
  return res.data;
};