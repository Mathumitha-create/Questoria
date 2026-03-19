import express from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/global", async (_req, res) => {
  const users = await User.find({ isBanned: false })
    .select(
      "username xpPoints level problemsSolved contestRating profilePhoto college",
    )
    .sort({ xpPoints: -1 })
    .limit(100);

  return res.json({ leaderboard: users });
});

router.get("/college", async (req, res) => {
  const college = req.query.college;
  const query = { isBanned: false };
  if (college) query.college = college;

  const users = await User.find(query)
    .select(
      "username xpPoints level problemsSolved contestRating profilePhoto college",
    )
    .sort({ xpPoints: -1 })
    .limit(100);

  return res.json({ leaderboard: users });
});

router.get("/friends", requireAuth, async (req, res) => {
  const me = await User.findById(req.user.sub).select("friends");
  const ids = [...(me?.friends || []), req.user.sub];

  const users = await User.find({ _id: { $in: ids }, isBanned: false })
    .select("username xpPoints level problemsSolved contestRating profilePhoto")
    .sort({ xpPoints: -1 });

  return res.json({ leaderboard: users });
});

export default router;
