import { Router, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// =======================================
// 👤 GET USERS BY IDS (bulk lookup)
// =======================================
router.post("/bulk", authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({ success: false, message: "ids array required" });
      return;
    }

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Ensure name fallback for users without name
    const usersWithName = users.map((u) => ({
      ...u,
      name: u.name || u.email.split("@")[0],
    }));

    res.status(200).json({ success: true, users: usersWithName });
  } catch (error) {
    next(error);
  }
});

// =======================================
// 👤 UPDATE PROFILE (name)
// =======================================
router.put("/profile", authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, message: "Name is required" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export default router;
