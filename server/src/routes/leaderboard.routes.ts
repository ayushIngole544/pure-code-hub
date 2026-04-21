import { Router } from "express";
import { fetchLeaderboard } from "../controllers/leaderboard.controller";

const router = Router();

router.get("/", fetchLeaderboard);

export default router;