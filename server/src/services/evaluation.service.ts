import prisma from "../config/prisma";
import { runCode, normalizeOutput } from "./execute.service";
import { SubmissionStatus } from "@prisma/client";

// ==========================================
// 🔥 Test Case Result
// ==========================================
interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  expected: string;
  actual: string;
  isHidden: boolean;
  error?: string;
}

// ==========================================
// 🔥 Evaluate a coding submission against test cases
// Unified: used by both direct submit and BullMQ worker
// ==========================================
export async function evaluateSubmission(
  submissionId: string,
  problemId: string,
  code: string,
  language: string
): Promise<{
  status: SubmissionStatus;
  score: number;
  passed: number;
  total: number;
  results: TestCaseResult[];
}> {

  // Fetch ALL test cases for the problem
  const testCases = await prisma.testCase.findMany({
    where: { problemId },
    orderBy: { id: "asc" },
  });

  if (testCases.length === 0) {
    // No test cases — mark as accepted (can't evaluate)
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.ACCEPTED, score: 100 },
    });
    return {
      status: SubmissionStatus.ACCEPTED,
      score: 100,
      passed: 0,
      total: 0,
      results: [],
    };
  }

  const results: TestCaseResult[] = [];
  let passedCount = 0;

  for (const tc of testCases) {
    try {
      const execResult = await runCode(code, language, tc.input || "");

      // Handle execution errors
      if (execResult.error) {
        const errorType = execResult.error;

        // Time limit exceeded — stop immediately
        if (errorType === "TIME_LIMIT_EXCEEDED") {
          results.push({
            testCaseId: tc.id,
            passed: false,
            expected: tc.isHidden ? "[hidden]" : normalizeOutput(tc.expectedOutput),
            actual: "Time Limit Exceeded",
            isHidden: tc.isHidden,
            error: "TIME_LIMIT_EXCEEDED",
          });

          // Update and return early
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: SubmissionStatus.TIME_LIMIT_EXCEEDED, score: 0 },
          });

          return {
            status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
            score: 0,
            passed: passedCount,
            total: testCases.length,
            results,
          };
        }

        // Docker not running
        if (errorType.includes("DOCKER_NOT_RUNNING")) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: SubmissionStatus.RUNTIME_ERROR, score: 0 },
          });

          return {
            status: SubmissionStatus.RUNTIME_ERROR,
            score: 0,
            passed: 0,
            total: testCases.length,
            results: [{
              testCaseId: tc.id,
              passed: false,
              expected: "",
              actual: "Docker is not running. Please start Docker Desktop.",
              isHidden: false,
              error: "DOCKER_NOT_RUNNING",
            }],
          };
        }

        // Code/input too large
        if (errorType === "CODE_TOO_LARGE" || errorType === "INPUT_TOO_LARGE" || errorType === "OUTPUT_TOO_LARGE") {
          results.push({
            testCaseId: tc.id,
            passed: false,
            expected: tc.isHidden ? "[hidden]" : normalizeOutput(tc.expectedOutput),
            actual: errorType.replace(/_/g, " "),
            isHidden: tc.isHidden,
            error: errorType,
          });
          continue;
        }

        // Runtime/compile error — record but continue
        results.push({
          testCaseId: tc.id,
          passed: false,
          expected: tc.isHidden ? "[hidden]" : normalizeOutput(tc.expectedOutput),
          actual: tc.isHidden ? "Runtime Error" : execResult.error.substring(0, 500),
          isHidden: tc.isHidden,
          error: "RUNTIME_ERROR",
        });
        continue;
      }

      // Normalize and compare outputs
      const actualOutput = normalizeOutput(execResult.output || "");
      const expectedOutput = normalizeOutput(tc.expectedOutput || "");
      const passed = actualOutput === expectedOutput;

      if (passed) passedCount++;

      results.push({
        testCaseId: tc.id,
        passed,
        expected: tc.isHidden ? "[hidden]" : expectedOutput,
        actual: tc.isHidden ? (passed ? "✅" : "❌") : actualOutput,
        isHidden: tc.isHidden,
      });

    } catch (err: any) {
      results.push({
        testCaseId: tc.id,
        passed: false,
        expected: tc.isHidden ? "[hidden]" : normalizeOutput(tc.expectedOutput),
        actual: "Internal Error",
        isHidden: tc.isHidden,
        error: err.message,
      });
    }
  }

  const score = Math.round((passedCount / testCases.length) * 100);

  // Determine final status
  let status: SubmissionStatus;
  if (passedCount === testCases.length) {
    status = SubmissionStatus.ACCEPTED;
  } else if (results.some((r) => r.error === "RUNTIME_ERROR")) {
    status = SubmissionStatus.RUNTIME_ERROR;
  } else {
    status = SubmissionStatus.WRONG_ANSWER;
  }

  // Update submission in DB
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status, score },
  });

  return { status, score, passed: passedCount, total: testCases.length, results };
}
