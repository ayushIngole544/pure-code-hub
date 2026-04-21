import { Request, Response } from "express";
import { getLeaderboard, getAssignmentLeaderboard } from "../services/leaderboard.service";


export const fetchLeaderboard = async (
  req: Request,
  res: Response
) => {
  try {
    const leaderboard = await getLeaderboard();

    res.status(200).json({
      success: true,
      leaderboard,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchAssignmentLeaderboard = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    const leaderboard = await getAssignmentLeaderboard(id);

    res.status(200).json({
      success: true,
      leaderboard,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};