import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import leaderboardRoutes from "./routes/leaderboard.routes";

// 🔹 Load env variables
dotenv.config();

// 🔹 Routes
import authRoutes from "./routes/auth.routes";
import problemsRoutes from "./routes/problems.routes";
import assignmentRoutes from "./routes/assignment.routes";
import executeRoutes from "./routes/execute.routes";
import submissionRoutes from "./routes/submission.routes";
import aiRoutes from "./routes/ai.routes";
import noteRoutes from "./routes/note.routes";
import notificationRoutes from "./routes/notification.routes";

// 🔹 Middleware
import { errorHandler } from "./middlewares/error.middleware";
import path from "path";

const app = express();
const port = process.env.PORT || 4000;

// ==============================
// 🔹 CORE MIDDLEWARES
// ==============================

// Enable CORS
app.use(
  cors({
    origin: "*", // ⚠️ later restrict to frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Parse JSON body
app.use(express.json());

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
// actually, let's keep it root-level:
// Wait, path.join(__dirname, "../uploads") inside src would map to `server/uploads`

// ==============================
// 🔹 API ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);

// ==============================
// 🔹 HEALTH CHECK
// ==============================

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

// ==============================
// 🔹 404 HANDLER
// ==============================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ==============================
// 🔹 GLOBAL ERROR HANDLER
// ==============================

app.use(errorHandler);

// ==============================
// 🔹 START SERVER
// ==============================

app.listen(port, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 http://localhost:${port}`);
  console.log("=================================");
});