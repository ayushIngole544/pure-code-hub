import { Router, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// =======================================
// 📝 GET WORKSPACE NOTES (teacher's personal notes without assignmentId)
// =======================================
router.get("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const notes = await prisma.note.findMany({
      where: {
        teacherId,
        assignmentId: null, // personal workspace notes only
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
});

// =======================================
// 📝 CREATE WORKSPACE NOTE
// =======================================
router.post("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { title, content } = req.body;

    const note = await prisma.note.create({
      data: {
        teacherId,
        title: title || "Untitled Note",
        content: content || "",
        assignmentId: null,
      },
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

// =======================================
// 📝 UPDATE WORKSPACE NOTE
// =======================================
router.put("/:id", authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const noteId = req.params.id as string;
    const { title, content } = req.body;

    // Verify ownership
    const existing = await prisma.note.findUnique({ where: { id: noteId } });
    if (!existing || existing.teacherId !== teacherId) {
      res.status(404).json({ success: false, message: "Note not found" });
      return;
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { title, content },
    });

    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
});

// =======================================
// 📝 DELETE WORKSPACE NOTE
// =======================================
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const noteId = req.params.id as string;

    // Verify ownership
    const existing = await prisma.note.findUnique({ where: { id: noteId } });
    if (!existing || existing.teacherId !== teacherId) {
      res.status(404).json({ success: false, message: "Note not found" });
      return;
    }

    await prisma.note.delete({ where: { id: noteId } });

    res.status(200).json({ success: true, message: "Note deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
