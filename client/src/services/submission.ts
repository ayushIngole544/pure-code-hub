import { api } from "./api";

// 🔥 SUBMIT QUESTION (Handles all types)
export const submitQuestion = async (
  assignmentId: string,
  questionId: string,
  data: { answer?: string; code?: string; language?: string }
) => {
  try {
    const res = await api.post("/submissions/question", {
      assignmentId,
      questionId,
      ...data
    });
    return res.data;
  } catch (error: any) {
    console.error("Submit Question Error:", error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Submission failed"
    );
  }
};

// 🔥 SUBMIT CODE (direct evaluation, no queue)
export const submitCode = async (
  problemId: string,
  code: string,
  language: string
) => {
  try {
    const res = await api.post("/submissions/problem", {
      problemId,
      code,
      language,
    });

    return res.data;
  } catch (error: any) {
    console.error("Submit Error:", error);

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Submission failed"
    );
  }
};

// 🔥 GET SINGLE SUBMISSION (IMPORTANT FOR POLLING)
export const getSubmission = async (id: string) => {
  try {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Fetch Submission Error:", error);

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Fetch failed"
    );
  }
};

// 🔥 GET ALL SUBMISSIONS
export const getSubmissions = async () => {
  try {
    const res = await api.get("/submissions");
    return res.data;
  } catch (error: any) {
    console.error("Get Submissions Error:", error);

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Fetch submissions failed"
    );
  }
};