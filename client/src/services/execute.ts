import { api } from "./api";

export const runCode = async (
  code: string,
  language: string,
  input: string
) => {
  const res = await api.post("/execute", {
    code,
    language,
    input,
  });

  return res.data.data;
};