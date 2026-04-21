import { Router } from "express";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../controllers/bookmark.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// 🔥 Get all bookmarks
router.get("/", authenticate, getBookmarks);

// 🔥 Add bookmark
router.post("/", authenticate, addBookmark);

// 🔥 Remove bookmark
router.delete("/:assessmentId", authenticate, removeBookmark);

export default router;