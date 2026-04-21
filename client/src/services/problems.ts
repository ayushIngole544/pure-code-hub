import { api } from "./api";

export const getAllProblems = async () => {
  const res = await api.get("/problems");
  return res.data.problems;
};

export const getProblemById = async (id: string) => {
  const res = await api.get(`/problems/${id}`);
  return res.data.problem;
};