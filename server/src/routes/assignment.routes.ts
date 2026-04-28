import { Router } from "express";
import {
  createAssignment,
  createAssignmentFull,
  publishAssignment,
  deleteAssignment,     // ✅ ADD THIS
  extendDeadline,       // ✅ ADD THIS
} from "../controllers/assignment.controller";
import { getAllAssignments } from "../services/assignment.service";
import { fetchAssignmentLeaderboard } from "../controllers/leaderboard.controller";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware";
import prisma from "../config/prisma";

const router = Router();

// =======================================
// 🧩 CREATE ASSIGNMENTS (TEACHER)
// =======================================

router.post(
  "/",
  authenticate,
  authorizeRoles("TEACHER"),
  createAssignment
);

router.post(
  "/create-full",
  authenticate,
  authorizeRoles("TEACHER"),
  createAssignmentFull
);

// =======================================
// 🚀 PUBLISH ASSIGNMENT
// =======================================

router.post(
  "/:id/publish",
  authenticate,
  authorizeRoles("TEACHER"),
  publishAssignment
);

// =======================================
// 🏆 LEADERBOARD
// =======================================

router.get(
  "/:id/leaderboard",
  authenticate,
  fetchAssignmentLeaderboard
);

// =======================================
// 🔥 TEACHER DRAFTS ONLY
// =======================================

router.get(
  "/teacher",
  authenticate,
  authorizeRoles("TEACHER"),
  async (req, res, next) => {
    try {
      const teacherId = (req as any).user.userId;

      const assignments = await prisma.assignment.findMany({
        where: {
          teacherId,
          isPublished: false, // 🔥 ONLY DRAFTS
        },
        include: {
          questions: true,
          problems: {
            include: {
              problem: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({
        success: true,
        assignments,
      });
    } catch (err) {
      next(err);
    }
  }
);

// =======================================
// 📚 TEACHER ALL (draft + published)
// =======================================

router.get(
  "/teacher/all",
  authenticate,
  authorizeRoles("TEACHER"),
  async (req, res, next) => {
    try {
      const teacherId = (req as any).user.userId;

      const assignments = await prisma.assignment.findMany({
        where: { teacherId },
        include: {
          questions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({
        success: true,
        assignments,
      });
    } catch (err) {
      next(err);
    }
  }
);

// =======================================
// 📚 ALL ASSIGNMENTS (STUDENTS)
// =======================================

router.get("/", authenticate, async (req, res, next) => {
  try {
    const assignments = await getAllAssignments((req as any).user);

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("TEACHER"),
  deleteAssignment
);
router.patch(
  "/:id/extend",
  authenticate,
  authorizeRoles("TEACHER"),
  extendDeadline
);

// =======================================
// 📄 GET SINGLE ASSIGNMENT
// =======================================
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id as string },

      include: {
        questions: {
          include: {
            problem: {
              include: {
                testCases: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (err) {
    next(err);
  }
});
export default router;