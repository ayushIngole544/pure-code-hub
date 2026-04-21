import prisma from "../config/prisma";
import { runCode } from "./execute.service"; // ✅ FIXED
import { SubmissionStatus } from "@prisma/client";

export const evaluateSubmission = async (
  problemId: string,
  code: string,
  language: string
) => {
  const testCases = await prisma.testCase.findMany({
    where: { problemId },
    orderBy: { id: "asc" },
  });

  if (!testCases.length) {
    throw new Error("No test cases found for this problem");
  }

  let passedCount = 0;
  let firstErrorStatus: SubmissionStatus | null = null;
  let firstErrorDetails: any = null;

  for (const testCase of testCases) {
    const result = await runCode(
      code,
      language,
      testCase.input || ""
    );

    // =============================
    // 🔴 TIME LIMIT EXCEEDED
    // =============================
    if (result.error === "TIME_LIMIT_EXCEEDED") {
      if (!firstErrorStatus) {
        firstErrorStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
      }
      continue;
    }

    // =============================
    // 🔴 RUNTIME ERROR
    // =============================
    if (result.error) {
      if (!firstErrorStatus) {
        firstErrorStatus = SubmissionStatus.RUNTIME_ERROR;
        firstErrorDetails = testCase.isHidden
          ? "Runtime Error on hidden test case"
          : result.error;
      }
      continue;
    }

    // =============================
    // 🔥 NORMALIZE OUTPUT
    // =============================
    const actual = (result.output || "")
      .trim()
      .replace(/\r\n/g, "\n");

    const expected = (testCase.expectedOutput || "")
      .trim()
      .replace(/\r\n/g, "\n");

    // =============================
    // ✅ CORRECT
    // =============================
    if (actual === expected) {
      passedCount++;
      continue;
    }

    // =============================
    // ❌ WRONG ANSWER
    // =============================
    if (!firstErrorStatus) {
      firstErrorStatus = SubmissionStatus.WRONG_ANSWER;
      firstErrorDetails = testCase.isHidden
        ? { message: "Wrong Answer on hidden test case" }
        : { input: testCase.input, expected, actual };
    }
  }

  // =============================
  // ✅ RETURN RESULTS
  // =============================
  return {
    status: firstErrorStatus || SubmissionStatus.ACCEPTED,
    passed: passedCount,
    total: testCases.length,
    error: firstErrorStatus === SubmissionStatus.RUNTIME_ERROR ? firstErrorDetails : undefined,
    ...(firstErrorStatus === SubmissionStatus.WRONG_ANSWER ? firstErrorDetails : {}),
  };
};