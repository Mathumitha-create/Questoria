import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Problem } from "../models/Problem.js";
import { Contest } from "../models/Contest.js";
import { ForumPost } from "../models/ForumPost.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", async (_req, res) => {
  const [users, problems, contests, reports] = await Promise.all([
    User.countDocuments(),
    Problem.countDocuments(),
    Contest.countDocuments(),
    ForumPost.countDocuments({ isReported: true }),
  ]);

  return res.json({
    users,
    problems,
    contests,
    reports,
  });
});

router.get("/users", async (_req, res) => {
  const users = await User.find()
    .select(
      "username email role isBanned xpPoints level streak problemsSolved contestRating createdAt",
    )
    .sort({ createdAt: -1 });
  return res.json({ users });
});

router.patch("/users/:id/ban", async (req, res) => {
  const { banned } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: !!banned },
    { new: true },
  ).select("username email isBanned role");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});

router.get("/reports", async (_req, res) => {
  const reports = await ForumPost.find({ isReported: true })
    .populate("user", "username email")
    .sort({ updatedAt: -1 });
  return res.json({ reports });
});

router.patch("/reports/:id/resolve", async (req, res) => {
  const post = await ForumPost.findByIdAndUpdate(
    req.params.id,
    { isReported: false },
    { new: true },
  );
  if (!post)
    return res.status(404).json({ message: "Reported post not found" });
  return res.json({ message: "Report resolved" });
});

export default router;
