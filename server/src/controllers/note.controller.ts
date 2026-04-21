import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacherId = (req as any).user.userId;
    const { title, content, assignmentId } = req.body;
    
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const note = await prisma.note.create({
      data: {
        teacherId,
        assignmentId: assignmentId || null,
        title,
        content,
        fileUrl,
      },
    });

    res.status(201).json({
      success: true,
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { assignmentId } = req.query;

    const whereClause: any = {};
    if (assignmentId) {
      whereClause.assignmentId = String(assignmentId);
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    next(error);
  }
};
