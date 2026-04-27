import { Queue } from "bullmq";
import IORedis from "ioredis";

// ==========================================
// 🔹 Redis Connection (graceful)
// ==========================================
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn("⚠️ Redis unavailable — queue-based submissions will fail. Direct mode still works.");
      return null; // Stop retrying
    }
    return Math.min(times * 500, 3000);
  },
});

connection.on("error", (err) => {
  // Suppress noisy Redis connection errors in dev
  if (!connection.status || connection.status === "end") return;
  console.warn("⚠️ Redis connection error (queue may be unavailable):", err.message);
});

export const submissionQueue = new Queue("submission-queue", {
  connection,
});

// ==========================================
// 🔥 Check if queue is available
// ==========================================
export async function isQueueAvailable(): Promise<boolean> {
  try {
    await connection.ping();
    return true;
  } catch {
    return false;
  }
}