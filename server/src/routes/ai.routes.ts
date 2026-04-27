import { Router } from "express";
import { generateQuestion } from "../controllers/ai.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// 🔥 Allow BOTH teacher + professional
router.post(
  "/generate-question",
  authenticate,
  authorizeRoles("TEACHER", "PROFESSIONAL"),
  generateQuestion
);

export default router;