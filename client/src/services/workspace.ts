import { api } from "./api";

// GET NOTES
export const getNotes = async () => {
  const res = await api.get("/workspace");
  return res.data;
};

// CREATE NOTE
export const createNote = async () => {
  const res = await api.post("/workspace", {
    title: "Untitled Note",
    content: "",
  });
  return res.data;
};

// UPDATE NOTE
export const updateNote = async (id: string, data: any) => {
  const res = await api.put(`/workspace/${id}`, data);
  return res.data;
};

// DELETE NOTE
export const deleteNote = async (id: string) => {
  const res = await api.delete(`/workspace/${id}`);
  return res.data;
};