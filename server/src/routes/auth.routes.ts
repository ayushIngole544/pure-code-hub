import express from "express";
import { signup, login } from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
const router = express.Router();

// 🔐 Apply rate limiter to all auth routes
// router.use(authLimiter);

// 🔐 Auth Routes
router.post("/signup", signup);
router.post("/login", login);

// 🧪 Test route (optional)
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

export default router;