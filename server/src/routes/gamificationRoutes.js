import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { applyRewardToUser, BADGE_RULES } from "../utils/gamification.js";

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get(
  "/leaderboard",
  asyncHandler(async (_req, res) => {
    const global = await User.find({ isBanned: false })
      .select(
        "username profilePhoto level levelTitle xpPoints points weeklyPoints problemsSolved streak",
      )
      .sort({ xpPoints: -1, points: -1 })
      .limit(100);

    const weekly = await User.find({ isBanned: false })
      .select("username profilePhoto level levelTitle weeklyPoints xpPoints")
      .sort({ weeklyPoints: -1, xpPoints: -1 })
      .limit(100);

    return res.json({ global, weekly });
  }),
);

router.post(
  "/reward/update",
  requireAuth,
  asyncHandler(async (req, res) => {
    const action = String(req.body?.action || "").toLowerCase();
    const allowedActions = [
      "problem_solved",
      "daily_login",
      "mock_interview_completed",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({ message: "Invalid reward action" });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = applyRewardToUser(user, action, req.body?.metadata || {});
    if (result.updated) {
      await user.save();
    }

    return res.json({
      reward: result,
      profile: {
        points: user.points,
        xpPoints: user.xpPoints,
        streak: user.streak,
        level: user.level,
        levelTitle: user.levelTitle,
        badges: user.badges,
        weeklyPoints: user.weeklyPoints,
      },
    });
  }),
);

router.get(
  "/badges",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub).select(
      "badges streak problemsSolved interviewsCompleted",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const available = BADGE_RULES.map((rule) => ({
      key: rule.key,
      unlocked: (user.badges || []).includes(rule.key),
    }));

    return res.json({ badges: user.badges || [], available });
  }),
);

router.get(
  "/daily-challenge",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const challenges = [
      {
        id: "daily-1",
        title: "Solve 1 problem",
        points: 10,
        action: "problem_solved",
      },
      {
        id: "daily-2",
        title: "Complete mock interview",
        points: 20,
        action: "mock_interview_completed",
      },
      {
        id: "daily-3",
        title: "Log in today",
        points: 5,
        action: "daily_login",
      },
    ];

    return res.json({ challenges });
  }),
);

export default router;
