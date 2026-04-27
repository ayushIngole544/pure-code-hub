import { api } from "./api";

export type AIRequest = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "MCQ" | "NAT" | "CODING";
};

export const generateAIQuestion = async (data: AIRequest) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const res = await api.post(
    "/ai/generate-question",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};