import { api } from "./api";

// 🔥 GET USERS BY IDS
export const getUsersByIds = async (ids: string[]) => {
  const res = await api.post("/users/bulk", { ids });
  return res.data;
};
export const updateProfile = async (name: string) => {
  const res = await api.put("/users/profile", { name });
  return res.data;
};