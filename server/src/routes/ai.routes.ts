import { Router } from "express";
import { generateQuestion } from "../controllers/ai.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// Only teachers can generate AI questions
router.post("/generate-question", authenticate, authorizeRoles("TEACHER"), generateQuestion);

export default router;
