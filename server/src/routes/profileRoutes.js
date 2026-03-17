import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { recalculateUserProgress } from "../utils/recalculateUserProgress.js";

const router = express.Router();

router.get("/stats", requireAuth, async (req, res) => {
  await recalculateUserProgress(req.user.sub);

  const user = await User.findById(req.user.sub).select(
    "username email profilePhoto xpPoints points level levelTitle badges rank streak problemsSolved contestRating weeklyPoints interviewsCompleted",
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  const betterUsers = await User.countDocuments({
    isBanned: false,
    xpPoints: { $gt: user.xpPoints },
  });

  const recentSubmissions = await Submission.find({ user: req.user.sub })
    .populate("problem", "title difficulty")
    .sort({ createdAt: -1 })
    .limit(10)
    .select("status runtime memory language createdAt passed problem");

  const recentInterviews = await InterviewSession.find({ userId: req.user.sub })
    .select("type difficulty score status createdAt")
    .sort({ createdAt: -1 })
    .limit(5);

  return res.json({
    username: user.username,
    points: user.points,
    xp: user.xpPoints,
    level: user.level,
    levelTitle: user.levelTitle,
    streak: user.streak,
    problemsSolved: user.problemsSolved,
    weeklyPoints: user.weeklyPoints,
    interviewsCompleted: user.interviewsCompleted,
    contestRating: user.contestRating,
    badges: user.badges,
    rank: betterUsers + 1,
    recentSubmissions,
    recentInterviews,
  });
});

router.get("/me", requireAuth, async (req, res) => {
  await recalculateUserProgress(req.user.sub);

  const user = await User.findById(req.user.sub).select(
    "username email profilePhoto xpPoints points level levelTitle badges rank streak problemsSolved contestRating bio college weeklyPoints interviewsCompleted",
  );
  if (!user) return res.status(404).json({ message: "User not found" });

  const submissions = await Submission.find({ user: req.user.sub })
    .populate("problem", "difficulty")
    .sort({ createdAt: -1 })
    .limit(200);

  const solvedOverTimeMap = new Map();
  for (const s of submissions) {
    if (!s.passed) continue;
    const date = s.createdAt.toISOString().slice(0, 10);
    solvedOverTimeMap.set(date, (solvedOverTimeMap.get(date) || 0) + 1);
  }

  const solvedOverTime = Array.from(solvedOverTimeMap.entries()).map(
    ([date, count]) => ({ date, count }),
  );

  const difficultyDistribution = { Easy: 0, Medium: 0, Hard: 0 };
  submissions.forEach((s) => {
    if (!s.passed) return;
    const difficulty = s.problem?.difficulty;
    if (difficultyDistribution[difficulty] !== undefined) {
      difficultyDistribution[difficulty] += 1;
    }
  });

  const interviewSessions = await InterviewSession.find({
    userId: req.user.sub,
    status: "completed",
  })
    .select("score type difficulty createdAt completedAt")
    .sort({ createdAt: 1 })
    .limit(100);

  const interviewPerformance = interviewSessions.map((item, idx) => ({
    index: idx + 1,
    score: item.score,
    type: item.type,
    difficulty: item.difficulty,
    date: new Date(item.completedAt || item.createdAt)
      .toISOString()
      .slice(0, 10),
  }));

  return res.json({
    profile: user,
    graphs: {
      solvedOverTime,
      difficultyDistribution,
      interviewPerformance,
      contestRatingHistory: [
        { label: "Jan", rating: Math.max(800, user.contestRating - 120) },
        { label: "Feb", rating: Math.max(800, user.contestRating - 60) },
        { label: "Mar", rating: user.contestRating },
      ],
    },
  });
});

router.patch("/me", requireAuth, async (req, res) => {
  const updates = {};
  ["username", "profilePhoto", "bio", "college"].forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user.sub, updates, {
    new: true,
  }).select(
    "username email profilePhoto xpPoints points level levelTitle badges rank streak problemsSolved contestRating bio college weeklyPoints interviewsCompleted",
  );
  return res.json({ profile: user });
});

export default router;
