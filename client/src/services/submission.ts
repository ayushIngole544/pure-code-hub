import { api } from "./api";

// ==========================================
// 🔥 SUBMIT FULL ASSESSMENT
// ==========================================
export const submitQuestion = async (
  assignmentId: string,
  _unused: any,
  data: {
    answers?: Record<string, string>;
    codes?: Record<string, string>;
    language?: string;
  }
) => {
  try {
    const res = await api.post("/submissions/question", {
      assignmentId,
      ...data,
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

// ==========================================
// 🔥 SUBMIT CODE (RESTORED)
// ==========================================
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
    console.error("Submit Code Error:", error);

    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Code submission failed"
    );
  }
};

// ==========================================
// 🔥 GET ALL SUBMISSIONS
// ==========================================
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