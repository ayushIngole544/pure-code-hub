import { api } from "./api";

export const getBookmarks = async () => {
  const res = await api.get("/bookmarks");
  return res.data;
};

export const addBookmark = async (assessmentId: string) => {
  const res = await api.post("/bookmarks", { assessmentId });
  return res.data;
};

export const removeBookmark = async (assessmentId: string) => {
  const res = await api.delete(`/bookmarks/${assessmentId}`);
  return res.data;
};