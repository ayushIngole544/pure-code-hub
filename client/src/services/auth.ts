import { api } from "./api";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const signupUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: string;
}) => {
  const res = await api.post("/auth/signup", {
    ...data,
    role: data.role.toUpperCase(), // 🔥 FIX HERE
  });

  return res.data;
};