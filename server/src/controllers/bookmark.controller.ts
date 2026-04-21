import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

// 🔥 GET BOOKMARKS
export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.userId;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      bookmarks,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔥 ADD BOOKMARK
export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.userId;
    const { assessmentId } = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: "assessmentId is required",
      });
    }

    // 🔥 Prevent duplicate crash
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_assessmentId: {
          userId,
          assessmentId,
        },
      },
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already bookmarked",
        bookmark: existing,
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        assessmentId,
      },
    });

    return res.json({
      success: true,
      bookmark,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔥 REMOVE BOOKMARK
export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.userId;

    // 🔥 FIX TYPE ISSUE
    const rawId = req.params.assessmentId;
    const assessmentId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: "assessmentId is required",
      });
    }

    // 🔥 Use deleteMany (safe, avoids crash if not found)
    await prisma.bookmark.deleteMany({
      where: {
        userId,
        assessmentId,
      },
    });

    return res.json({
      success: true,
      message: "Bookmark removed",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};