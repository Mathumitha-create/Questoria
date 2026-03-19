import express from "express";
import { ForumPost } from "../models/ForumPost.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const posts = await ForumPost.find()
    .populate("user", "username profilePhoto")
    .populate("comments.user", "username profilePhoto")
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json({ posts });
});

router.post("/", requireAuth, async (req, res) => {
  const { title, content, tags = [] } = req.body;
  const post = await ForumPost.create({
    user: req.user.sub,
    title,
    content,
    tags,
  });
  return res.status(201).json({ post });
});

router.post("/:id/upvote", requireAuth, async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const already = post.upvotes.some((u) => u.toString() === req.user.sub);
  if (already) {
    post.upvotes = post.upvotes.filter((u) => u.toString() !== req.user.sub);
  } else {
    post.upvotes.push(req.user.sub);
  }

  await post.save();
  return res.json({ upvotes: post.upvotes.length });
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ user: req.user.sub, content: req.body.content });
  await post.save();

  return res.status(201).json({ message: "Comment added" });
});

router.post("/:id/report", requireAuth, async (req, res) => {
  const post = await ForumPost.findByIdAndUpdate(
    req.params.id,
    { isReported: true },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.json({ message: "Reported" });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const isOwner = post.user?.toString() === req.user.sub;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ message: "You can only delete your own posts" });
  }

  await ForumPost.findByIdAndDelete(req.params.id);
  return res.json({ message: "Post deleted" });
});

router.get("/reports/all", requireAuth, requireAdmin, async (_req, res) => {
  const reports = await ForumPost.find({ isReported: true }).sort({
    updatedAt: -1,
  });
  return res.json({ reports });
});

export default router;
