import { Router } from "express";
import {
  submitQuestion,
  getSubmissionById,
  getAllSubmissions,
} from "../controllers/submission.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// 🔥 Submit (MCQ / NAT / CODING)
router.post("/", authenticate, submitQuestion);

// 🔥 Get all submissions (current user)
router.get("/", authenticate, getAllSubmissions);

// 🔥 Get submission by ID
router.get("/:id", authenticate, getSubmissionById);

export default router;