import { Router } from "express";
import {
  createProblem,
  getAllProblems,
  getProblemById,
} from "../controllers/problem.controller";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware";

const router = Router();

// 🧩 Create Problem (Teacher only)
router.post(
  "/",
  authenticate,
  authorizeRoles("TEACHER"),
  createProblem
);

// 📚 Get all problems (accessible to all logged-in users)
router.get("/", authenticate, getAllProblems);

// 🔍 Get single problem by ID
router.get("/:id", authenticate, getProblemById);

export default router;