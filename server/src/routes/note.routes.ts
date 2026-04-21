import { Router } from "express";
import { createNote, getNotes } from "../controllers/note.controller";
import { authenticate } from "../middlewares/auth.middleware";
import multer from "multer";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../../uploads/"); // Adjust based on index.ts configuration
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post("/create", authenticate, upload.single("file"), createNote);
router.get("/", authenticate, getNotes);

export default router;
