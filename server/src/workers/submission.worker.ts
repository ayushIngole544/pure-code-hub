import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "../config/prisma";
import { evaluateSubmission } from "../services/evaluate.service";

// ==========================================
// 🔹 Redis Connection
// ==========================================
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// ==========================================
// 🔥 Worker Startup
// ==========================================
console.log("🚀 Submission Worker is running...");

// ==========================================
// 🔥 WORKER
// ==========================================
const worker = new Worker(
  "submission-queue",
  async (job) => {
    const startTime = Date.now();

    console.log("📥 Processing job:", job.data);

    const { submissionId, problemId, code, language } = job.data;

    try {
      // 🔥 Run evaluation
      const result = await evaluateSubmission(problemId, code, language);

      if (!result || !result.status) {
        throw new Error("Invalid evaluation result");
      }

      const isAccepted = result.status === "ACCEPTED";
      let calculatedScore = 0;

      // 🔥 Fetch associated submission and problem to calculate marks
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { problem: true }
      });

      if (submission?.problem?.marks && result.total > 0) {
        const marks = submission.problem.marks;
        calculatedScore = Math.floor((result.passed / result.total) * marks);
      } else if (isAccepted) {
        calculatedScore = submission?.problem?.marks || 10;
      }

      // 🔥 Update DB (IMPORTANT FIX)
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: result.status,
          score: calculatedScore,
          // note: the 'passed' boolean field was not in the db schema I read earlier,
          // but just in case it was added manually without migration mapping, 
          // wait, let's verify if `passed` was requested or if we can ignore it since it used to exist
          // actually earlier schema didn't have passed in Submission.
        },
      });

      const duration = Date.now() - startTime;

      console.log("✅ Submission updated:", {
        submissionId,
        status: result.status,
        score: calculatedScore,
        time: `${duration}ms`,
      });

      return result;

    } catch (error: any) {
      console.error("❌ Error processing submission:", {
        submissionId,
        error: error.message,
      });

      // 🔥 Mark as failed in DB
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: "RUNTIME_ERROR",
          score: 0,
        },
      });

      throw error;
    }
  },
  { connection }
);

// ==========================================
// 🔹 EVENTS
// ==========================================

// ✅ Job completed
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

// ❌ Job failed
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

// 🔄 Worker error
worker.on("error", (err) => {
  console.error("🔥 Worker error:", err);
});