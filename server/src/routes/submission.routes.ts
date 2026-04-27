import { Router } from "express";
import {
  submitQuestion,
  submitProblem,
  getSubmissionById,
  getAllSubmissions,
} from "../controllers/submission.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// 🔥 Submit (MCQ / NAT / CODING) — primary endpoint
router.post("/", authenticate, submitQuestion);

// 🔥 Submit (alias for frontend compat)
router.post("/question", authenticate, submitQuestion);

// 🔥 Submit problem (professional direct evaluation)
router.post("/problem", authenticate, submitProblem);

// 🔥 Get all submissions (current user)
router.get("/", authenticate, getAllSubmissions);

// 🔥 Get submission by ID
router.get("/:id", authenticate, getSubmissionById);

export default router;
