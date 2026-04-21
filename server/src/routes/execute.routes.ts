import { Router } from "express";
import { executeCode } from "../controllers/execute.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Protected route (only logged-in users)
router.post("/", authenticate, executeCode);

export default router;