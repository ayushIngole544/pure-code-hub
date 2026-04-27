import express from "express";
import { signup, login } from "../controllers/auth.controller";

const router = express.Router();

// 🔐 Auth Routes
router.post("/signup", signup);
router.post("/login", login);

// 🧪 Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Auth working ✅" });
});

export default router;