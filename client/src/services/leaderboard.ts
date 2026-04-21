import { api } from "./api";

export const getLeaderboard = async () => {
  const res = await api.get("/leaderboard");
  return res.data;
};