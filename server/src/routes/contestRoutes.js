import express from "express";
import mongoose from "mongoose";
import { Contest } from "../models/Contest.js";
import { Submission } from "../models/Submission.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function contestBucket(c) {
  const now = new Date();
  if (c.startsAt <= now && c.endsAt >= now) return "live";
  if (c.startsAt > now) return "upcoming";
  return "past";
}

router.get("/", requireAuth, async (req, res) => {
  const contests = await Contest.find()
    .populate("problems", "title difficulty acceptanceRate")
    .sort({ startsAt: 1 });

  const grouped = { live: [], upcoming: [], past: [] };
  contests.forEach((c) => {
    const contest = c.toObject();
    contest.participantsCount = (contest.participants || []).length;
    contest.isRegistered = (contest.participants || []).some(
      (p) => p.toString() === req.user.sub,
    );
    grouped[contestBucket(c)].push(contest);
  });

  return res.json(grouped);
});

router.post("/:id/register", requireAuth, async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return res.status(404).json({ message: "Contest not found" });

  if (new Date() > contest.endsAt) {
    return res.status(400).json({ message: "Contest has already ended" });
  }

  await Contest.findByIdAndUpdate(contest._id, {
    $addToSet: { participants: req.user.sub },
  });

  return res.json({ message: "Registered successfully" });
});

router.get("/:id/leaderboard", requireAuth, async (req, res) => {
  const contestId = req.params.id;
  const contest = await Contest.findById(contestId).select("title");
  if (!contest) return res.status(404).json({ message: "Contest not found" });

  const rows = await Submission.aggregate([
    {
      $match: {
        contest: new mongoose.Types.ObjectId(contestId),
        passed: true,
      },
    },
    {
      $group: {
        _id: {
          user: "$user",
          problem: "$problem",
        },
        firstAcceptedAt: { $min: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$_id.user",
        solved: { $sum: 1 },
        lastSolveTime: { $max: "$firstAcceptedAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        username: "$user.username",
        profilePhoto: "$user.profilePhoto",
        solved: 1,
        lastSolveTime: 1,
      },
    },
    { $sort: { solved: -1, lastSolveTime: 1 } },
  ]);

  const leaderboard = rows.map((r, index) => ({ ...r, rank: index + 1 }));
  return res.json({ contest: contest.title, leaderboard });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const contest = await Contest.create({
    ...req.body,
    createdBy: req.user.sub,
  });
  return res.status(201).json({ contest });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!contest) return res.status(404).json({ message: "Contest not found" });
  return res.json({ contest });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await Contest.findByIdAndDelete(req.params.id);
  return res.json({ message: "Contest deleted" });
});

export default router;
