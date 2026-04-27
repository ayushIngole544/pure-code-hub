import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ==============================
// 🔹 ROUTES IMPORT
// ==============================
import authRoutes from "./routes/auth.routes";
import problemsRoutes from "./routes/problems.routes";
import assignmentRoutes from "./routes/assignment.routes";
import executeRoutes from "./routes/execute.routes";
import submissionRoutes from "./routes/submission.routes";
import aiRoutes from "./routes/ai.routes";
import noteRoutes from "./routes/note.routes";
import notificationRoutes from "./routes/notification.routes";
import bookmarkRoutes from "./routes/bookmark.routes";
import workspaceRoutes from "./routes/workspace.routes";
import userRoutes from "./routes/user.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";

// ==============================
// 🔹 MIDDLEWARE
// ==============================
import { errorHandler } from "./middlewares/error.middleware";

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// ==============================
// 🔹 DEBUG ROUTE LOGGER (TEMP)
// ==============================
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// ==============================
// 🔹 API ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemsRoutes);

// 🔥 Dual support (good)
app.use("/api/assignments", assignmentRoutes);
app.use("/api/assessments", assignmentRoutes);

app.use("/api/execute", executeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/users", userRoutes);

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
// 🔹 ERROR HANDLER
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