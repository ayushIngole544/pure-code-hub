import { Queue } from "bullmq";
import IORedis from "ioredis";

// ✅ FIXED REDIS CONFIG
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // 🔥 IMPORTANT
});

export const submissionQueue = new Queue("submission-queue", {
  connection,
});