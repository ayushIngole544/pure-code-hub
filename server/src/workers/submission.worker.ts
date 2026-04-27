import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "../config/prisma";
import { evaluateSubmission } from "../services/evaluation.service";

// ==========================================
// 🔹 Redis Connection
// ==========================================
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

// ==========================================
// 🔥 Worker Startup
// ==========================================
console.log("🚀 Submission Worker is running...");

// ==========================================
// 🔥 WORKER — processes coding submissions
// ==========================================
const worker = new Worker(
  "submission-queue",
  async (job) => {
    const startTime = Date.now();

    console.log("📥 Processing job:", job.data);

    const { submissionId, problemId, code, language } = job.data;

    try {
      // Run unified evaluation
      const result = await evaluateSubmission(
        submissionId,
        problemId,
        code,
        language
      );

      const duration = Date.now() - startTime;

      console.log("✅ Submission evaluated:", {
        submissionId,
        status: result.status,
        score: result.score,
        passed: `${result.passed}/${result.total}`,
        time: `${duration}ms`,
      });

      return result;
    } catch (error: any) {
      console.error("❌ Error processing submission:", {
        submissionId,
        error: error.message,
      });

      // Mark as failed in DB
      try {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: "RUNTIME_ERROR",
            score: 0,
          },
        });
      } catch (dbErr) {
        console.error("❌ Failed to update submission status:", dbErr);
      }

      throw error;
    }
  },
  { connection }
);

// ==========================================
// 🔹 EVENTS
// ==========================================
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("🔥 Worker error:", err);
});